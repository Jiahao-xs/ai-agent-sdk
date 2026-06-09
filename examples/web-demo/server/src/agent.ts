import { createAgent, calculatorTool, dateTimeTool } from 'ai-agent-sdk';
import type { Agent } from 'ai-agent-sdk';

/**
 * 创建并配置 Agent 实例
 */
export function createChatAgent(): Agent {
  const apiKey = process.env.OPENAI_API_KEY;
  const basePath = process.env.OPENAI_API_BASE;
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  return createAgent({
    model: {
      provider: 'openai',
      name: modelName,
      apiKey,
      basePath,
    },
    tools: [calculatorTool, dateTimeTool],
    prompt:
      '你是一个智能助手，请使用中文回答用户的问题。你可以使用计算器工具进行数学计算，以及日期时间工具查询当前时间。',
  });
}
