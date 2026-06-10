## Context

当前 SDK 的 `createAgent` 接受扁平配置（model、tools、prompt、mcpServers），用户需要手动组装所有要素。当多个 Agent 共享相同的能力组合（如"天气分析师"= 特定提示词 + 计算器工具 + 天气 MCP）时，配置会大量重复。

Skill 系统将这种组合封装为 Markdown 文件，SDK 负责解析和注入，实现能力的模块化和复用。

## Goals / Non-Goals

**Goals:**

- Skill 文件（SKILL.md）包含指令内容 + 声明式依赖（tools、mcpServers）
- `loadSkill()` / `loadSkills()` 从文件系统加载 Skill
- `createAgent` 接受 `skills` 参数，自动合并 Skill 声明到 Agent 配置
- 工具声明通过名称查找，支持内置注册表 + 用户 toolPool
- MCP 声明复用现有优雅降级机制
- 向后兼容：所有现有 API 不变

**Non-Goals:**

- Skill 运行时变量/模板替换（如 `{{city}}`）——后续版本
- Skill 间依赖关系（Skill A 依赖 Skill B 的输出）——后续版本
- Skill 热重载/动态加载——后续版本
- Skill 市场/注册中心——后续版本

## Decisions

### 1. Frontmatter 解析库选择

**决策**: 使用 `gray-matter`

**理由**:

- `gray-matter` 是 frontmatter 解析的事实标准，GitHub/VuePress/Hugo 都在用
- 支持 YAML frontmatter + 任意 body 内容
- 体积小（~5KB），无原生依赖
- 备选 `front-matter` 功能类似但社区更小

### 2. Skill 类型设计

```typescript
interface Skill {
  name: string; // 唯一标识
  description?: string; // 一句话说明
  version?: string; // 语义化版本
  content: string; // Markdown body（指令内容）
  requiredTools?: string[]; // 声明需要的工具名
  requiredMcpServers?: Record<string, MCPServerConfig>; // 声明需要的 MCP
}
```

**理由**: 将 frontmatter 映射为强类型接口，`content` 是纯字符串（不做 Markdown 解析），保持简单。

### 3. 工具查找策略

```
Skill 声明 tools: ["calculator", "myTool"]
    │
    ▼
1. 查内置注册表（calculator → calculatorTool）
2. 查用户 toolPool（myTool → 用户传入的工具对象）
3. 找不到 → 打印 warning，跳过该工具
```

**理由**: 混合策略兼顾零配置（内置工具）和灵活性（自定义工具）。用户不需要为内置工具传对象，只需写名字。

### 4. 多 Skill 合并规则

| 字段       | 合并策略                                      |
| ---------- | --------------------------------------------- |
| tools      | 并集，同名保留第一个，打印 warning            |
| mcpServers | 并集，同名保留第一个，打印 warning            |
| content    | 按 skills 数组顺序拼接，用 `\n\n---\n\n` 分隔 |
| prompt     | 用户 prompt 追加在所有 Skill content 之后     |

**理由**: 顺序拼接保证优先级可控（数组前面的 Skill 优先级更高），分隔符让 LLM 能区分不同 Skill 的指令边界。

### 5. SKILL.md 文件约定

- 文件名必须为 `SKILL.md`（大写）
- 目录名即 Skill 的默认 name（frontmatter 可覆盖）
- `loadSkills(dir)` 递归扫描子目录中的 `SKILL.md`

**理由**: 与 `.qoder/skills/` 的约定一致，降低认知成本。

## Risks / Trade-offs

- **[frontmatter 解析失败]** → 抛出明确错误，包含文件路径和解析错误信息，不静默跳过
- **[工具名找不到]** → 打印 warning 并跳过，不阻塞 Agent 启动（与 MCP 降级策略一致）
- **[Skill content 过长]** → 多个 Skill 拼接后可能超出 LLM context window，用户需自行控制 Skill 数量和内容长度
- **[gray-matter 依赖]** → 新增一个运行时依赖，但体积小且稳定
