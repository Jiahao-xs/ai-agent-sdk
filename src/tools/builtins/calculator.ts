import { z } from 'zod';
import { defineTool } from '../index';

/** 内置计算器工具 */
export const calculatorTool = defineTool({
  name: 'calculator',
  description: '用于数学计算的工具，支持加减乘除和括号运算',
  parameters: z.object({
    expression: z.string().describe('要计算的数学表达式，例如: (1 + 2) * 3'),
  }),
  execute: ({ expression }: { expression: string }) => {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${sanitized}`)();
      return `计算结果: ${expression} = ${result}`;
    } catch {
      return `计算错误: 无法计算表达式 "${expression}"`;
    }
  },
});
