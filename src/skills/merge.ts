import type { StructuredToolInterface } from '@langchain/core/tools';
import type { MCPServerConfig } from '../mcp';
import type { Skill } from '../core/types';

/** mergeSkills 的合并结果 */
export interface MergedSkillResult {
  tools: StructuredToolInterface[];
  mcpServers: Record<string, MCPServerConfig>;
  content: string;
}

/**
 * 合并多个 Skill 的 tools、mcpServers、content
 * @param skills Skill 数组
 */
export function mergeSkills(skills: Skill[]): MergedSkillResult {
  const mcpMap = new Map<string, MCPServerConfig>();
  const contentParts: string[] = [];
  const requiredToolNames: string[] = [];

  for (const skill of skills) {
    // 合并 content
    if (skill.content) {
      contentParts.push(skill.content);
    }

    // 收集需要解析的工具名
    if (skill.requiredTools) {
      requiredToolNames.push(...skill.requiredTools);
    }
  }

  // 合并 mcpServers
  for (const skill of skills) {
    if (skill.requiredMcpServers) {
      for (const [name, config] of Object.entries(skill.requiredMcpServers)) {
        if (mcpMap.has(name)) {
          process.stderr.write(
            `[Skill] MCP 服务器名称冲突: "${name}" — 保留第一个 Skill 的配置\n`,
          );
        } else {
          mcpMap.set(name, config);
        }
      }
    }
  }

  return {
    tools: [], // 工具解析在 createAgent 中完成（需要 toolPool）
    mcpServers: Object.fromEntries(mcpMap),
    content: contentParts.join('\n\n---\n\n'),
  };
}
