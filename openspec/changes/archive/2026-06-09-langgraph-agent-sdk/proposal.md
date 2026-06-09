## Why

当前 AI Agent 开发领域存在两个极端：LangGraph 提供了强大的图编排能力但 API 过于底层，学习曲线陡峭；而 LangChain 的 AgentExecutor 虽然简单但缺乏灵活性，无法处理复杂的多步骤工作流。开发者需要一个既能快速上手、又能渐进式深入控制的 TypeScript SDK，让第三方开发者无需理解 LangGraph 底层图机制，即可构建功能完备的 AI 智能体。

## What Changes

- 新建 `ai-agent-sdk` 项目，基于 LangGraph + TypeScript + pnpm 构建通用可复用 SDK
- 实现**双层 API 架构**：
  - 声明式 `createAgent()` — 开箱即用的 ReAct 模式，覆盖 80% 常见场景
  - 图构建器 `AgentGraph` — 面向高级用户的显式流程编排
- 实现 LLM 三模式适配层：支持字符串 / 配置对象 / LangChain 模型实例三种传参方式
- 实现工具系统：`defineTool` 函数式 + `BaseTool` 类式两种工具定义方式
- 内置 2-3 个示例工具（计算器、日期时间等）
- 配置 ESLint + Prettier 代码规范
- 提供完整 TypeScript 类型定义和基础使用示例

## Capabilities

### New Capabilities

- `agent-factory`: 声明式 Agent 构建器，`createAgent()` API，封装 ReAct 模式的完整生命周期（初始化、运行、流式输出、销毁）
- `agent-graph`: 图构建器 API，`AgentGraph` 类，支持显式添加节点、边、条件路由，编译为可执行的 LangGraph 图
- `tool-system`: 工具定义与注册系统，包含 `defineTool` 函数式 API、`BaseTool` 抽象类、工具注册表，以及内置示例工具
- `llm-adapter`: LLM 适配层，统一接口封装，支持字符串/配置对象/LangChain 实例三种传参模式，对接 LangGraph 底层 ChatModel
- `project-scaffold`: 项目基础设施，包含 pnpm 配置、TypeScript 编译配置、ESLint + Prettier 代码规范、目录结构、构建脚本

### Modified Capabilities

（无，这是全新项目）

## Impact

- **依赖**: `@langchain/langgraph`、`@langchain/core`、`@langchain/openai`、`zod`（参数校验）、`dotenv`（环境变量）
- **开发依赖**: `typescript`、`eslint`、`@typescript-eslint/*`、`prettier`、`eslint-config-prettier`、`eslint-plugin-prettier`、`tsup`（库打包）、`vitest`（测试）
- **代码**: 全新项目，无已有代码受影响
- **API**: 首次发布，所有 API 均为新增
- **系统**: 需要 Node.js >= 18，pnpm >= 8
