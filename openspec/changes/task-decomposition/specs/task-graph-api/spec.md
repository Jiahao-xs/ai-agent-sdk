## ADDED Requirements

### Requirement: TaskGraph 高层 API

系统 SHALL 提供 `TaskGraph` 类，封装 Planner + Executor 的完整编排流程，对外暴露简洁的 `run()` 和 `stream()` 接口。

#### Scenario: 一行代码执行完整流程

- **WHEN** 调用 `taskGraph.run('开发一个用户管理模块')`
- **THEN** 系统自动执行：Planner 拆分任务 → Executor 按 DAG 执行 → 汇总结果，返回 `TaskGraphResult`

#### Scenario: 流式执行带进度

- **WHEN** 调用 `taskGraph.stream('开发管理后台', { onTaskStart, onTaskEnd, onProgress })`
- **THEN** 系统执行完整流程，同时通过回调实时通知每个子任务的开始、完成和整体进度

### Requirement: TaskGraph 配置

`TaskGraph` SHALL 接受配置对象，支持模型、Skill、工具、重试策略等全局配置。

#### Scenario: 最简配置

- **WHEN** 创建 `new TaskGraph({ model: 'gpt-4o-mini' })`
- **THEN** 使用默认 Planner prompt 和默认执行策略

#### Scenario: 完整配置

- **WHEN** 创建 `new TaskGraph({ model, skills, tools, retryCount: 2, maxConcurrency: 3 })`
- **THEN** 所有子任务共享配置的模型和 Skill，最多 3 个任务并行执行，失败重试 2 次

#### Scenario: 自定义 Planner prompt

- **WHEN** 配置中包含 `plannerPrompt: '专注于后端任务拆分'`
- **THEN** Planner 使用该自定义 prompt 进行任务拆分

### Requirement: TaskGraphResult 结果

`TaskGraph.run()` SHALL 返回 `TaskGraphResult`，包含所有子任务的结果汇总。

#### Scenario: 全部成功

- **WHEN** 所有子任务执行成功
- **THEN** TaskGraphResult 的 status 为 'success'，tasks 数组包含每个子任务的 TaskResult

#### Scenario: 部分失败

- **WHEN** 某些子任务执行失败
- **THEN** TaskGraphResult 的 status 为 'partial'，tasks 数组中成功任务 status 为 'success'，失败任务 status 为 'failed'

#### Scenario: 结果包含汇总

- **WHEN** 所有任务执行完成
- **THEN** TaskGraphResult 包含 totalDuration（总耗时）、completedCount、failedCount 统计信息

### Requirement: 手动构建任务 DAG

系统 SHALL 支持用户手动构建任务 DAG，绕过 LLM Planner。

#### Scenario: 代码定义 DAG

- **WHEN** 用户调用 `TaskGraph.fromDAG([{ id: 'a', ... }, { id: 'b', dependsOn: ['a'], ... }])`
- **THEN** 系统使用用户定义的任务 DAG 直接执行，不调用 Planner

#### Scenario: 从 JSON 加载 DAG

- **WHEN** 用户调用 `TaskGraph.fromDAG(jsonTaskDefinitions)`
- **THEN** 系统解析 JSON 为任务 DAG 并执行

### Requirement: 与 Skill 系统集成

TaskGraph SHALL 支持将 Skill 列表传入配置，Planner 在拆分任务时可参考可用 Skill 列表。

#### Scenario: Planner 感知可用 Skill

- **WHEN** TaskGraph 配置了 `skills: [weatherSkill, translatorSkill]`
- **THEN** Planner 在拆分任务时知道可用 Skill，并在任务定义中推荐合适的 Skill

#### Scenario: 子任务自动加载 Skill

- **WHEN** 任务定义中指定了 `skill: 'weather-analyst'`
- **THEN** Executor 为该任务创建 Agent 时自动加载对应 Skill 的 prompt、工具和 MCP 配置
