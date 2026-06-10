import { createAgent, loadSkills } from '@jiahao/ai-agent-sdk';
import type { Agent } from '@jiahao/ai-agent-sdk';
import path from 'path';

/**
 * 创建并配置 Agent 实例
 * 使用 Skill 技能插件系统：从文件加载 Skill，自动注入 prompt、工具和 MCP 配置
 */
export async function createChatAgent(): Promise<Agent> {
  const apiKey = process.env.OPENAI_API_KEY;
  const basePath = process.env.OPENAI_API_BASE;
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // 从项目 skills 目录加载所有 Skill（也可用 loadSkill 加载单个）
  const skillsDir = path.resolve(__dirname, '../../../skills');
  const skills = await loadSkills(skillsDir);

  return createAgent({
    model: {
      provider: 'openai',
      name: modelName,
      apiKey,
      basePath,
    },
    // Skill 会自动注入：
    // - prompt（SKILL.md body 内容）
    // - tools（frontmatter 中声明的工具名，从内置注册表查找）
    // - mcpServers（frontmatter 中声明的 MCP 配置）
    skills,
    // 仍可额外添加自定义工具和提示词，与 Skill 合并
    prompt: '你是一个智能助手，请使用中文回答用户的问题。',
  });
}
