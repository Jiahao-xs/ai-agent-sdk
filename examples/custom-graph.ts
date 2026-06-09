/**
 * AgentGraph 图构建器使用示例
 *
 * 运行: npx ts-node examples/custom-graph.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { AgentGraph } from '../src';

interface MyState {
  input: string;
  classification: string;
  result: string;
}

async function main() {
  // 使用图构建器创建自定义工作流
  const graph = new AgentGraph<MyState>()
    .addNode('classify', async state => {
      const input = state.input as string;
      const isMath = /[\d+\-*/()]/.test(input);
      return { classification: isMath ? 'math' : 'text' };
    })
    .addNode('math_handler', async state => {
      const input = state.input as string;
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${input}`)();
        return { result: `数学计算结果: ${result}` };
      } catch {
        return { result: '无法计算该表达式' };
      }
    })
    .addNode('text_handler', async state => {
      return { result: `文本处理: 收到消息 "${state.input}"` };
    })
    .addEdge('classify', 'math_handler')
    .addEdge('classify', 'text_handler')
    .addConditionalEdge('classify', state => {
      return state.classification === 'math' ? 'math_handler' : 'text_handler';
    });

  const compiled = graph.compile();

  // 执行图
  const result = await compiled.invoke({
    input: '1 + 2 * 3',
    classification: '',
    result: '',
  });

  console.log('图执行结果:', result);
}

main().catch(console.error);
