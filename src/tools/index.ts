import { tool } from '@langchain/core/tools';
import type { StructuredTool } from '@langchain/core/tools';
import type { ZodSchema } from 'zod';
import type { DefineToolConfig } from '../core/types';

/**
 * 函数式定义工具
 */
export function defineTool<T extends Record<string, unknown>>(
  config: DefineToolConfig<T>,
): StructuredTool {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return tool(
    async (params: any) => {
      return config.execute(params as T);
    },
    {
      name: config.name,
      description: config.description,
      schema: config.parameters as any,
    },
  ) as unknown as StructuredTool;
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/**
 * BaseTool 抽象类 - 用于创建有状态工具
 */
export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: ZodSchema;

  abstract execute(params: Record<string, unknown>): Promise<string> | string;

  /** 将 BaseTool 转换为 StructuredTool */
  toStructuredTool(): StructuredTool {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return tool(
      async (params: any) => {
        return this.execute(params);
      },
      {
        name: this.name,
        description: this.description,
        schema: this.parameters as any,
      },
    ) as unknown as StructuredTool;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

/**
 * 工具注册表
 */
export class ToolRegistry {
  private tools: Map<string, StructuredTool> = new Map();

  register(tool: StructuredTool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): StructuredTool | undefined {
    return this.tools.get(name);
  }

  getAll(): StructuredTool[] {
    return Array.from(this.tools.values());
  }
}
