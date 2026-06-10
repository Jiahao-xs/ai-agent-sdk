import type { MCPServerConfig } from '../mcp';

/** SKILL.md frontmatter 元数据 */
export interface SkillFrontmatter {
  /** 技能名称（必需） */
  name: string;
  /** 一句话说明 */
  description?: string;
  /** 语义化版本 */
  version?: string;
  /** 声明需要的工具名列表 */
  tools?: string[];
  /** 声明需要的 MCP 服务器配置 */
  mcpServers?: Record<string, MCPServerConfig>;
}
