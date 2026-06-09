## Context

本项目是一个全新的 TypeScript SDK，旨在封装 LangGraph 的底层能力，为第三方开发者提供简洁直觉化的 API 来构建 AI 智能体。项目从零开始，无历史包袱。

核心约束：
- 底层引擎为 `@langchain/langgraph`，SDK 是其上层封装
- 使用 pnpm 管理依赖，单包结构（目录按模块边界划分）
- TypeScript strict 模式，完整类型导出
- 目标运行时：Node.js >= 18

## Goals / Non-Goals

**Goals:**

- 提供 `createAgent()` 声明式 API，一行代码创建可用的 ReAct Agent
- 提供 `AgentGraph` 图构建器 API，支持显式编排复杂工作流
- LLM 适配层支持三种传参模式（字符串 / 配置对象 / LangChain 实例）
- 工具系统同时支持 `defineTool` 函数式和 `BaseTool` 类式
- 流式输出支持
- 完整的 TypeScript 类型定义
- 开箱即用的 ESLint + Prettier 配置
- 2-3 个内置示例工具和使用示例

**Non-Goals:**

- 不实现记忆/状态持久化（后续版本）
- 不实现中间件系统（后续版本）
- 不实现 Human-in-the-loop（后续版本）
- 不实现多 Agent 协作（后续版本）
- 不实现 CLI 调试工具（后续版本）
- 不做 monorepo 拆分（后续按需迁移）
- 不自行封装 LLM HTTP 调用（复用 LangChain 生态）

## Decisions

### D1: 双层 API 架构

**决策**: SDK 提供两层 API — 声明式 `createAgent()` 和图构建器 `AgentGraph`。

**理由**: 80% 的场景用声明式即可满足，复杂场景通过图构建器实现。`createAgent()` 内部等价于构建一个标准 ReAct 图，是 `AgentGraph` 的语法糖。两者共享工具系统、LLM 适配层等基础设施。

**替代方案**: 只提供一层 API → 要么牺牲易用性（只有图构建器），要么牺牲灵活性（只有声明式）。

### D2: 声明式 API 仅限 ReAct 模式

**决策**: `createAgent()` 只实现标准 ReAct（Reason-Act-Observe 循环）模式。

**理由**: ReAct 是最通用的 Agent 模式，覆盖大多数对话+工具调用场景。预置过多模式（map-reduce、router 等）会增加 API 复杂度，且这些用 `AgentGraph` 实现更直观。

**替代方案**: 提供 pattern 参数支持多种模式 → 过早优化，增加维护负担。

### D3: LLM 适配层三模式传参

**决策**: `model` 参数支持三种传入方式：
1. 字符串 `'gpt-4'` → 默认 OpenAI 快捷创建
2. 配置对象 `{ provider: 'openai', name: 'gpt-4' }` → SDK 内部实例化
3. LangChain 模型实例 `new ChatOpenAI(...)` → 直接透传

**理由**: 字符串模式降低入门门槛，配置对象平衡简洁与灵活，实例模式保留完整控制权。内部通过类型判断统一转换为 LangChain ChatModel 实例。

**替代方案**: 只支持实例传入 → 对新手不友好；只支持字符串 → 高级用户无法定制。

### D4: 工具系统双模式

**决策**: 同时支持 `defineTool()` 函数式和 `BaseTool` 抽象类。

**理由**: 函数式适合无状态工具（占大多数），代码更简洁；类式适合需要内部状态、生命周期管理或复杂依赖注入的工具。两者最终都转换为 LangChain `StructuredTool` 实例。

### D5: 单包结构 + 模块化目录

**决策**: 使用单包结构，但目录按未来可拆分的模块边界组织：`core/`、`agents/`、`tools/`、`llm/`。

**理由**: 单包起步开发速度快、配置简单、使用者一次安装。模块化目录确保未来拆分 monorepo 时只需移动文件夹 + 添加 package.json，无需重构代码。

**替代方案**: 直接 monorepo → 初期配置复杂，迭代速度慢。

### D6: 构建工具选择 tsup

**决策**: 使用 `tsup`（基于 esbuild）作为库打包工具，同时输出 ESM 和 CJS。

**理由**: tsup 零配置支持双格式输出，构建速度极快（esbuild 底层），对库开发友好。相比纯 tsc，tsup 能自动处理 bundle 和 tree-shaking。

**替代方案**: 纯 tsc → 只输出 CJS，无 bundle；rollup → 配置复杂，构建慢。

## Risks / Trade-offs

- **[LangGraph 版本耦合]** SDK 深度依赖 LangGraph API，上游 breaking change 可能影响 SDK。→ 通过内部适配层隔离，对外暴露的 API 与 LangGraph 原语解耦。
- **[单包体积]** 所有模块在一个包中，使用者即使只用部分功能也需全量安装。→ MVP 阶段可接受，依赖树不会太深；后续可拆包。
- **[ReAct 局限性]** 声明式 API 只支持 ReAct，某些特殊场景（如需要并行工具调用）无法覆盖。→ 这些场景可使用 AgentGraph，文档中明确说明边界。
- **[TypeScript 类型复杂度]** 三模式传参和双模式工具系统的类型推导可能较复杂。→ 使用 TypeScript 函数重载和条件类型，配合充分的 JSDoc 注释。
