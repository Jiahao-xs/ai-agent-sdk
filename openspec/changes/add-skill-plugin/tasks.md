## 1. 依赖与类型

- [x] 1.1 安装 `gray-matter` 依赖到根 package.json
- [x] 1.2 在 `src/core/types.ts` 中新增 `Skill` 接口（name, description?, version?, content, requiredTools?, requiredMcpServers?）
- [x] 1.3 在 `src/core/types.ts` 中扩展 `AgentConfig`，新增 `skills?: Skill[]` 和 `toolPool?: StructuredToolInterface[]` 字段
- [x] 1.4 在 `src/core/index.ts` 和 `src/index.ts` 中导出 `Skill` 类型

## 2. Skill 加载器

- [x] 2.1 创建 `src/skills/types.ts`，定义 Skill 相关类型（如 SkillFrontmatter）
- [x] 2.2 创建 `src/skills/loader.ts`，实现 `parseSkillFile(content: string, fallbackName?: string): Skill` 函数（使用 gray-matter 解析 frontmatter）
- [x] 2.3 创建 `src/skills/loader.ts`，实现 `loadSkill(filePath: string): Promise<Skill>` 异步函数（读取文件 + 解析）
- [x] 2.4 创建 `src/skills/loader.ts`，实现 `loadSkills(dirPath: string): Promise<Skill[]>` 异步函数（递归扫描目录）
- [x] 2.5 创建 `src/skills/index.ts`，统一导出 loader 函数和类型
- [x] 2.6 在 `src/index.ts` 中导出 `loadSkill`、`loadSkills`

## 3. 工具注册表

- [x] 3.1 创建 `src/skills/registry.ts`，实现内置工具注册表（将 "calculator" → calculatorTool, "dateTime" → dateTimeTool 注册）
- [x] 3.2 实现 `resolveToolByName(name: string, toolPool?: StructuredToolInterface[]): StructuredToolInterface | null` 函数（先查内置注册表，再查 toolPool）

## 4. Skill 与 Agent 集成

- [x] 4.1 创建 `src/skills/merge.ts`，实现 `mergeSkills(skills: Skill[]): MergedSkillResult` 函数（合并 tools、mcpServers、content）
- [x] 4.2 修改 `src/agents/create-agent.ts`，在 `createAgent` 函数开头处理 skills 参数：解析 Skill 声明、合并 tools/mcpServers/prompt
- [x] 4.3 在 `createAgent` 中实现工具声明解析：遍历 Skill 的 requiredTools，调用 resolveToolByName 查找并挂载
- [x] 4.4 在 `createAgent` 中实现 MCP 声明合并：将 Skill 的 requiredMcpServers 合并到 config.mcpServers
- [x] 4.5 在 `createAgent` 中实现 prompt 合并：Skill content 按序拼接 + 用户 prompt 追加

## 5. 验证

- [x] 5.1 创建示例 SKILL.md 文件（如 `examples/skills/weather-analyst/SKILL.md`）
- [x] 5.2 运行 `tsc --noEmit` 验证类型检查通过
- [x] 5.3 运行 ESLint 验证代码规范
- [ ] 5.4 编写集成测试：loadSkill 解析文件、createAgent 使用 Skill 创建 Agent
