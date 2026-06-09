/**
 * 基础 Agent 使用示例
 *
 * 运行: npx ts-node examples/basic-agent.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { createAgent, calculatorTool, dateTimeTool } from '../src';

async function main() {
  // 创建 Agent（声明式 API）
  const agent = createAgent({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    tools: [calculatorTool, dateTimeTool],
    prompt: '你是一个智能助手，可以使用工具来帮助用户完成任务。请用中文回答。',
  });

  // 简单对话
  console.log('--- 简单对话 ---');
  const result1 = await agent.run('你好，请介绍一下你自己');
  console.log(result1.output);
  console.log(`耗时: ${result1.duration}ms\n`);

  // 工具调用
  console.log('--- 工具调用 ---');
  const result2 = await agent.run('请帮我计算 (123 + 456) * 7 的结果');
  console.log(result2.output);
  console.log(`耗时: ${result2.duration}ms\n`);

  // 流式输出
  console.log('--- 流式输出 ---');
  process.stdout.write('助手: ');
  const result3 = await agent.stream('用一句话解释什么是人工智能', chunk => {
    process.stdout.write(chunk);
  });
  console.log(`\n耗时: ${result3.duration}ms`);
}

main().catch(console.error);
