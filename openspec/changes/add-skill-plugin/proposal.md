## Why

当前 SDK 的 Agent 配置（tools、prompt、mcpServers）是扁平的、手动的，用户每次创建 Agent 都需要重复编写相同的提示词和工具组合。Skill 系统将 Prompt Engineering 文件化、模块化、可复用——一个 `SKILL.md` 文件封装指令 + 声明依赖，SDK 自动解析并注入 Agent，实现"写一次，到处用"。

## What Changes

- 新增 `SKILL.md` 文件格式规范：YAML frontmatter（name, description, tools, mcpServers）+ Markdown body（指令内容）
- 新增 `loadSkill(filePath)` 函数：解析单个 SKILL.md 文件，返回 Skill 对象
- 新增 `loadSkills(dirPath)` 函数：从目录批量加载所有 SKILL.md
- `AgentConfig` 新增 `skills` 字段：接受 `Skill[]`，自动合并 tools、mcpServers、prompt
- `createAgent` 内部实现 Skill 声明解析：从 frontmatter 提取工具名和 MCP 配置，自动挂载
- 新增工具注册表机制：内置工具按名查找，支持用户自定义工具池
- Skill 声明的 MCP 连接失败时优雅降级（复用现有降级机制）

## Capabilities

### New Capabilities

- `skill-loader`: SKILL.md 文件解析与加载——frontmatter 解析、body 提取、单文件/目录批量加载、内联 Skill 对象支持
- `skill-integration`: Skill 与 Agent 的集成——Skill 声明解析（tools/mcpServers）、多 Skill 合并规则、prompt 注入、工具注册表查找

### Modified Capabilities

- `agent-factory`: `AgentConfig` 新增 `skills` 和 `toolPool` 字段，`createAgent` 内部增加 Skill 合并逻辑
- `tool-system`: 新增工具注册表，支持按名称查找内置工具和用户自定义工具

## Impact

- **新增依赖**: 需要 YAML frontmatter 解析库（`gray-matter` 或 `front-matter`）
- **新增模块**: `src/skills/` 目录（loader、types、registry）
- **修改模块**: `src/core/types.ts`（新增 Skill 类型）、`src/agents/create-agent.ts`（Skill 合并逻辑）
- **导出变更**: `src/index.ts` 新增 `loadSkill`、`loadSkills`、`Skill` 类型导出
- **向后兼容**: 所有现有 API 不变，skills 是可选字段
