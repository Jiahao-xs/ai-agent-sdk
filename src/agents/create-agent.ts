import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage, isAIMessage, isToolMessage } from '@langchain/core/messages';
import { resolveModel } from '../llm';
import type { AgentConfig, AgentResult, Agent, StreamEvents } from '../core/types';
import { MCPClientManager, mergeTools } from '../mcp';
import { mergeSkills, resolveToolByName } from '../skills';

const DEFAULT_SYSTEM_PROMPT = '你是一个智能助手，请使用中文回答用户的问题。';
const DEFAULT_MAX_ITERATIONS = 10;

/**
 * 创建声明式 Agent（ReAct 模式）
 */
export async function createAgent(config: AgentConfig): Promise<Agent> {
  const model = resolveModel(config.model);
  let tools = config.tools || [];
  let systemPrompt = config.prompt || DEFAULT_SYSTEM_PROMPT;
  const maxIterations = config.maxIterations ?? DEFAULT_MAX_ITERATIONS;

  // ── Skill 集成 ───
  if (config.skills && config.skills.length > 0) {
    const merged = mergeSkills(config.skills);

    // 合并 prompt：Skill content 在前，用户 prompt 在后
    if (merged.content) {
      systemPrompt = merged.content + '\n\n---\n\n' + systemPrompt;
    }

    // 解析 Skill 声明的工具
    for (const skill of config.skills) {
      if (skill.requiredTools) {
        for (const toolName of skill.requiredTools) {
          const resolved = resolveToolByName(toolName, config.toolPool);
          if (resolved) {
            // 去重：同名工具保留第一个
            if (!tools.some(t => t.name === toolName)) {
              tools.push(resolved);
            }
          } else {
            // eslint-disable-next-line no-console
            console.warn(`[Skill] 工具 '${toolName}' 未找到，已跳过`);
          }
        }
      }
    }

    // 合并 Skill 声明的 MCP 服务器到 config.mcpServers
    if (merged.mcpServers && Object.keys(merged.mcpServers).length > 0) {
      config.mcpServers = { ...merged.mcpServers, ...config.mcpServers };
    }
  }

  // MCP 集成：如果配置了 mcpServers，尝试连接并获取远程工具
  // 连接失败时优雅降级（如 uvx 未安装），不阻塞 Agent 启动
  let mcpManager: MCPClientManager | null = null;
  if (config.mcpServers) {
    mcpManager = new MCPClientManager();
    try {
      const remoteTools = await mcpManager.connect(config.mcpServers);
      tools = mergeTools(tools, remoteTools);
      // eslint-disable-next-line no-console
      console.log('[Agent] MCP 工具加载成功');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Agent] MCP 工具加载失败，将以无 MCP 模式运行:',
        err instanceof Error ? err.message : err,
      );
      mcpManager = null;
    }
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

    async stream(input: string, events: StreamEvents): Promise<AgentResult> {
      const startTime = Date.now();
      let fullOutput = '';

      const stream = await agent.stream(
        { messages: [new HumanMessage(input)] },
        { recursionLimit: maxIterations + 1, streamMode: 'updates' },
      );

      for await (const event of stream) {
        // agent 节点输出：LLM token 或工具调用请求
        if (event.agent?.messages) {
          for (const msg of event.agent.messages) {
            // 文本片段
            const content = typeof msg.content === 'string' ? msg.content : '';
            if (content && events.onToken) {
              fullOutput += content;
              events.onToken(content);
            }
            // AIMessage 中的 tool_calls → 触发 onToolStart
            if (isAIMessage(msg) && msg.tool_calls && msg.tool_calls.length > 0) {
              for (const tc of msg.tool_calls) {
                events.onToolStart?.({ tool: tc.name, args: tc.args });
              }
            }
          }
        }
        // tools 节点输出：工具执行结果
        if (event.tools?.messages) {
          for (const msg of event.tools.messages) {
            if (isToolMessage(msg)) {
              const result =
                typeof msg.content === 'string'
                  ? msg.content
                  : JSON.stringify(msg.content);
              events.onToolEnd?.({ tool: msg.name || 'unknown', result });
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
