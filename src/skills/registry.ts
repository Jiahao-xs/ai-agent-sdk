import type { StructuredToolInterface } from '@langchain/core/tools';
import { calculatorTool } from '../tools/builtins/calculator';
import { dateTimeTool } from '../tools/builtins/date-time';

/** 内置工具注册表：工具名 → 工具实例 */
const builtinRegistry = new Map<string, StructuredToolInterface>();

// 注册内置工具
builtinRegistry.set('calculator', calculatorTool);
builtinRegistry.set('dateTime', dateTimeTool);

/**
 * 按名称查找工具
 * 优先级：1) 内置注册表  2) 用户 toolPool
 * @param name 工具名称
 * @param toolPool 用户自定义工具池
 */
export function resolveToolByName(
  name: string,
  toolPool?: StructuredToolInterface[],
): StructuredToolInterface | null {
  // 1. 查内置注册表
  const builtin = builtinRegistry.get(name);
  if (builtin) return builtin;

  // 2. 查用户 toolPool
  if (toolPool) {
    const custom = toolPool.find(t => t.name === name);
    if (custom) return custom;
  }

  return null;
}
