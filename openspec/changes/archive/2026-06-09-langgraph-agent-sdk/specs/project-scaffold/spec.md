## ADDED Requirements

### Requirement: pnpm 项目初始化
系统 SHALL 使用 pnpm 作为包管理器，package.json 中定义正确的依赖、脚本和元信息。

#### Scenario: 依赖声明
- **WHEN** 项目初始化完成
- **THEN** package.json 包含运行时依赖（@langchain/langgraph, @langchain/core, @langchain/openai, zod, dotenv）和开发依赖（typescript, eslint, prettier 等）

#### Scenario: npm scripts
- **WHEN** 使用者运行 `pnpm run build`
- **THEN** 系统使用 tsup 编译 TypeScript 并输出 ESM + CJS 双格式到 dist/ 目录

#### Scenario: 开发脚本
- **WHEN** 使用者运行 `pnpm run dev`
- **THEN** 系统以开发模式运行示例代码

### Requirement: TypeScript 配置
系统 SHALL 配置 TypeScript strict 模式，支持路径别名和声明文件输出。

#### Scenario: strict 模式
- **WHEN** TypeScript 编译时
- **THEN** 启用 strict、noUncheckedIndexedAccess、esModuleInterop 等严格选项

#### Scenario: 路径别名
- **WHEN** 源代码中使用 `@/tools` 等路径别名
- **THEN** TypeScript 编译器正确解析到 `src/tools` 目录

### Requirement: ESLint 配置
系统 SHALL 配置 ESLint，使用 @typescript-eslint 解析器并集成 Prettier。

#### Scenario: lint 检查
- **WHEN** 使用者运行 `pnpm run lint`
- **THEN** ESLint 检查 src/ 下所有 .ts 文件，报告违规项

#### Scenario: lint 修复
- **WHEN** 使用者运行 `pnpm run lint:fix`
- **THEN** ESLint 自动修复可修复的问题

### Requirement: Prettier 配置
系统 SHALL 提供 .prettierrc 配置文件，统一代码风格。

#### Scenario: 格式化检查
- **WHEN** 使用者运行 `pnpm run format:check`
- **THEN** Prettier 检查代码格式是否符合规范

#### Scenario: 格式化修复
- **WHEN** 使用者运行 `pnpm run format`
- **THEN** Prettier 自动格式化所有源代码

### Requirement: 目录结构
系统 SHALL 按模块化边界组织源代码目录。

#### Scenario: 模块目录
- **WHEN** 项目初始化完成
- **THEN** src/ 下包含 `core/`、`agents/`、`tools/`、`llm/` 子目录，每个目录有 `index.ts` 入口文件

#### Scenario: 统一导出
- **WHEN** 使用者从 SDK 导入 `import { createAgent, defineTool, AgentGraph } from 'ai-agent-sdk'`
- **THEN** 所有公共 API 通过 src/index.ts 统一导出

### Requirement: 使用示例
系统 SHALL 在 examples/ 目录下提供基础使用示例。

#### Scenario: 声明式示例
- **WHEN** 使用者查看 `examples/basic-agent.ts`
- **THEN** 示例展示如何使用 `createAgent()` 创建 Agent 并执行对话

#### Scenario: 图构建器示例
- **WHEN** 使用者查看 `examples/custom-graph.ts`
- **THEN** 示例展示如何使用 `AgentGraph` 构建自定义工作流
