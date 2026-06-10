/**
 * Skill 技能插件使用示例
 *
 * 运行: npx ts-node examples/skill-demo.ts
 *
 * 演示四种使用方式：
 * 1. 从单个 SKILL.md 文件加载
 * 2. 从目录批量加载所有 Skill
 * 3. 内联 Skill 对象（无需文件）
 * 4. 在 createAgent 中使用 Skill
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { createAgent, loadSkill, loadSkills, type Skill } from '../src';
import path from 'path';

// ─── 方式 1: 从单个文件加载 ───────────────────────────────────────
async function exampleLoadSingle() {
  const skill = await loadSkill(
    path.resolve(__dirname, 'skills/weather-analyst/SKILL.md'),
  );
  console.log('Skill 名称:', skill.name);
  console.log('Skill 描述:', skill.description);
  console.log('声明的工具:', skill.requiredTools);
  console.log('声明的 MCP:', Object.keys(skill.requiredMcpServers || {}));
}

// ─── 方式 2: 从目录批量加载 ───────────────────────────────────────
async function exampleLoadDirectory() {
  const skillsDir = path.resolve(__dirname, 'skills');
  const skills = await loadSkills(skillsDir);
  console.log(`加载了 ${skills.length} 个 Skill`);
  for (const s of skills) {
    console.log(`  - ${s.name}: ${s.description}`);
  }
}

// ─── 方式 3: 内联 Skill 对象（无需文件）────────────────────────────
const inlineSkill: Skill = {
  name: 'translator',
  description: '专业翻译助手',
  content: `你是一个专业翻译，请将用户输入翻译为英文。
要求：
- 保持原文语气和风格
- 专业术语保留原文并在括号中附注
- 输出格式：原文 → 译文`,
};

// ─── 方式 4: 在 createAgent 中使用 ────────────────────────────────
async function exampleCreateAgent() {
  // 从目录加载所有 Skill
  const skills = await loadSkills(path.resolve(__dirname, 'skills'));

  const agent = await createAgent({
    model: {
      provider: 'openai',
      name: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
      basePath: process.env.OPENAI_API_BASE,
    },
    // 传入 skills 数组，SDK 自动：
    // - 将 Skill content 注入系统提示词
    // - 按名称从内置注册表/toolPool 解析工具
    // - 合并 Skill 声明的 MCP 服务器配置
    skills,
    // 用户自定义提示词会追加在 Skill content 之后
    prompt: '请用简洁的中文回答。',
    // 自定义工具池：Skill 声明的工具名会从这里查找
    // toolPool: [myCustomTool],
  });

  // 运行对话
  const result = await agent.run('今天北京天气怎么样？');
  console.log('回答:', result.output);
  console.log('耗时:', result.duration, 'ms');
}

// ─── 运行示例 ─────────────────────────────────────────────────────
async function main() {
  console.log('=== 方式 1: 单文件加载 ===');
  await exampleLoadSingle();

  console.log('\n=== 方式 2: 目录批量加载 ===');
  await exampleLoadDirectory();

  console.log('\n=== 方式 4: createAgent 使用 Skill ===');
  await exampleCreateAgent();
}

main().catch(console.error);
