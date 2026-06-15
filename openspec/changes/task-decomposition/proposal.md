## Why

当前 SDK 的 `createAgent()` 和 `AgentGraph` 都是"单进单出"模式 — 接收一个输入，产出一个结果。面对复杂需求（如"开发一个管理后台系统"），单个 Agent 无法自主将需求拆分为多个有依赖关系的子任务并协调执行。需要一种高层编排能力，让 Agent 能够自动规划、拆分、调度并执行多步骤任务。

## What Changes

- 新增 `TaskPlanner`：接收高层需求，通过 LLM 分析并生成结构化的任务 DAG（含依赖关系）
- 新增 `TaskExecutor`：按 DAG 顺序执行子任务，每个子任务由独立的 Agent 实例处理，支持不同的 Skill/工具/MCP 配置
- 新增 `TaskGraph` 高层 API：封装 Planner + Executor 的编排流程，对外暴露 `run()` 和 `stream()` 接口
- 任务间上下文传递：通过共享状态（结构化 State）+ 产出物（artifacts）实现跨任务信息流转
- 支持执行失败重试和动态计划调整（子任务失败后回退到 Planner 重新规划）
- 扩展 `AgentGraph` 支持运行时动态添加节点（当前节点在编译时固定）

## Capabilities

### New Capabilities

- `task-planner`: LLM 驱动的任务规划与拆分，将高层需求解析为结构化任务 DAG
- `task-executor`: 子任务执行引擎，按 DAG 依赖顺序执行，支持并行和上下文传递
- `task-graph-api`: 面向用户的高层 API，封装 Planner + Executor 的完整编排流程

### Modified Capabilities

- `agent-graph`: 扩展支持运行时动态节点添加和并行执行分支

## Impact

- **新增模块**: `src/tasks/` 目录，包含 planner、executor、types、graph 等文件
- **修改模块**: `src/agents/agent-graph.ts` 需扩展动态节点能力
- **类型扩展**: `src/core/types.ts` 新增 Task、TaskDAG、TaskResult 等类型
- **导出更新**: `src/index.ts` 新增 TaskGraph、TaskPlanner 等导出
- **依赖**: 无新增外部依赖，基于现有 LangGraph + LLM 能力构建
- **向后兼容**: 纯新增功能，不修改现有 API，完全向后兼容
