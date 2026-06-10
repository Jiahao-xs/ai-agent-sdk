import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Skill } from '../core/types';
import type { SkillFrontmatter } from './types';

/**
 * 解析 SKILL.md 文件内容，提取 frontmatter 和 body
 * @param content 文件原始内容
 * @param fallbackName 目录名（当 frontmatter 缺少 name 时使用）
 */
export function parseSkillFile(content: string, fallbackName?: string): Skill {
  const parsed = matter(content);
  const fm = parsed.data as SkillFrontmatter;

  if (!fm || typeof fm !== 'object') {
    throw new Error('SKILL.md frontmatter 解析失败：未找到有效的 YAML frontmatter');
  }

  const name = fm.name || fallbackName;
  if (!name) {
    throw new Error('SKILL.md frontmatter 缺少 name 字段，且未提供 fallbackName');
  }

  return {
    name,
    description: fm.description,
    version: fm.version,
    content: parsed.content.trim(),
    requiredTools: fm.tools,
    requiredMcpServers: fm.mcpServers,
  };
}

/**
 * 从文件路径加载单个 Skill
 * @param filePath SKILL.md 文件路径
 */
export async function loadSkill(filePath: string): Promise<Skill> {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`SKILL.md 文件不存在: ${resolved}`);
  }

  const content = await fs.promises.readFile(resolved, 'utf-8');
  const dirName = path.basename(path.dirname(resolved));

  return parseSkillFile(content, dirName);
}

/**
 * 从目录批量加载所有 SKILL.md 文件
 * @param dirPath 技能目录路径
 */
export async function loadSkills(dirPath: string): Promise<Skill[]> {
  const resolved = path.resolve(dirPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`技能目录不存在: ${resolved}`);
  }

  const skills: Skill[] = [];
  const entries = await fs.promises.readdir(resolved, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillFile = path.join(resolved, entry.name, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        const skill = await loadSkill(skillFile);
        skills.push(skill);
      }
    } else if (entry.isFile() && entry.name === 'SKILL.md') {
      // 支持根目录直接放 SKILL.md
      const skill = await loadSkill(path.join(resolved, entry.name));
      skills.push(skill);
    }
  }

  return skills;
}
