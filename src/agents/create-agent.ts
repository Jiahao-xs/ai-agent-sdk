import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { resolveModel } from '../llm';
import type { AgentConfig, AgentResult, Agent } from '../core/types';
import { MCPClientManager, mergeTools } from '../mcp';

const DEFAULT_SYSTEM_PROMPT = '你是一个智能助手，请使用中文回答用户的问题。';
const DEFAULT_MAX_ITERATIONS = 10;

/**
 * 创建声明式 Agent（ReAct 模式）
 */
export async function createAgent(config: AgentConfig): Promise<Agent> {
  const model = resolveModel(config.model);
  let tools = config.tools || [];
  const systemPrompt = config.prompt || DEFAULT_SYSTEM_PROMPT;
  const maxIterations = config.maxIterations ?? DEFAULT_MAX_ITERATIONS;

  // MCP 集成：如果配置了 mcpServers，连接并获取远程工具
  const mcpManager = config.mcpServers ? new MCPClientManager() : null;
  if (mcpManager && config.mcpServers) {
    const remoteTools = await mcpManager.connect(config.mcpServers);
    tools = mergeTools(tools, remoteTools);
  }

  // 如果 model 支持 temperature 且用户指定了，设置它
  if (config.temperature !== undefined && 'temperature' in model) {
    (model as Record<string, unknown>).temperature = config.temperature;
  }

  const agent = createReactAgent({
    llm: model,
    tools,
    messageModifier: systemPrompt,
  });

  return {
    async run(input: string): Promise<AgentResult> {
      const startTime = Date.now();
      let iterations = 0;

      const result = await agent.invoke(
        { messages: [new HumanMessage(input)] },
        {
          recursionLimit: maxIterations + 1,
        },
      );

      iterations = result.messages?.length || 0;
      void iterations; // suppress unused warning

      const lastMessage = result.messages[result.messages.length - 1];
      const output =
        typeof lastMessage?.content === 'string'
          ? lastMessage.content
          : JSON.stringify(lastMessage?.content);

      return { output, duration: Date.now() - startTime };
    },

    async stream(input: string, onChunk: (chunk: string) => void): Promise<AgentResult> {
      const startTime = Date.now();
      let fullOutput = '';

      const stream = await agent.stream(
        { messages: [new HumanMessage(input)] },
        { recursionLimit: maxIterations + 1 },
      );

      for await (const event of stream) {
        // agent 节点输出（LLM token）
        if (event.agent?.messages) {
          for (const msg of event.agent.messages) {
            const content = typeof msg.content === 'string' ? msg.content : '';
            if (content) {
              fullOutput += content;
              onChunk(content);
            }
          }
        }
      }

      return { output: fullOutput, duration: Date.now() - startTime };
    },

    async close(): Promise<void> {
      if (mcpManager) {
        await mcpManager.close();
      }
    },
  };
}
