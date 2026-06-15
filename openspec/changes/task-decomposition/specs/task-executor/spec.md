## ADDED Requirements

### Requirement: TaskExecutor 执行引擎

系统 SHALL 提供 `TaskExecutor` 类，接收任务 DAG 并按依赖顺序执行每个子任务。

#### Scenario: 顺序执行有依赖的任务

- **WHEN** 任务 DAG 为 A → B → C（线性依赖）
- **THEN** TaskExecutor 按 A、B、C 顺序依次执行，每个任务在前一个完成后才开始

#### Scenario: 并行执行无依赖的任务

- **WHEN** 任务 DAG 中 A 和 B 无依赖，C 依赖 A 和 B
- **THEN** TaskExecutor 并行执行 A 和 B，两者都完成后执行 C

#### Scenario: 单任务执行

- **WHEN** 任务 DAG 只有一个任务（无依赖）
- **THEN** TaskExecutor 直接执行该任务并返回结果

### Requirement: 子任务 Agent 创建

TaskExecutor SHALL 为每个子任务创建独立的 Agent 实例，支持从任务定义中读取 Skill、工具等配置。

#### Scenario: 使用任务声明的 Skill

- **WHEN** 任务定义的 skill 字段为 'weather-analyst'
- **THEN** TaskExecutor 为该任务创建 Agent 时加载对应的 Skill 并注入 prompt 和工具

#### Scenario: 使用任务声明的工具

- **WHEN** 任务定义的 tools 字段为 ['calculator', 'dateTime']
- **THEN** TaskExecutor 为该任务创建 Agent 时注册对应的工具

#### Scenario: 继承全局配置

- **WHEN** 任务未声明特定 Skill 或工具
- **THEN** TaskExecutor 使用 TaskGraph 全局配置创建 Agent（共享 model、prompt 等）

### Requirement: 共享 State 上下文

TaskExecutor SHALL 维护一个 `TaskGraphState` 对象，在任务间传递上下文。

#### Scenario: 前序任务产出传递给后续任务

- **WHEN** 任务 A 完成后在 State 中写入 `{ modules: ['user-model'] }`
- **THEN** 任务 B 执行时可从 State 中读取 `modules` 字段

#### Scenario: State 累积

- **WHEN** 任务 A 写入 `{ files: ['a.ts'] }`，任务 B 写入 `{ files: ['b.ts'] }`
- **THEN** 任务 C 执行时 State 中 files 包含 `['a.ts', 'b.ts']`

### Requirement: 任务执行结果

每个子任务执行完成后 SHALL 返回 `TaskResult`，包含任务 ID、输出内容、状态（成功/失败）和耗时。

#### Scenario: 成功执行

- **WHEN** 子任务 Agent 正常完成任务
- **THEN** TaskResult 的 status 为 'success'，output 包含 Agent 的输出内容

#### Scenario: 执行失败

- **WHEN** 子任务 Agent 执行出错（如 LLM 报错）
- **THEN** TaskResult 的 status 为 'failed'，error 包含错误信息

### Requirement: 失败重试

TaskExecutor SHALL 支持子任务失败后自动重试，可配置重试次数。

#### Scenario: 重试成功

- **WHEN** 子任务执行失败，配置 `retryCount: 2`
- **THEN** TaskExecutor 自动重试该任务，最多重试 2 次，重试成功则继续执行后续任务

#### Scenario: 重试耗尽

- **WHEN** 子任务重试 2 次后仍然失败
- **THEN** TaskExecutor 标记该任务为最终失败，根据策略跳过或中止

### Requirement: 动态计划调整

TaskExecutor SHALL 支持在执行过程中根据前序任务的结果动态调整后续计划。

#### Scenario: 跳过不再需要的任务

- **WHEN** 任务 A 的产出表明任务 B 不再需要执行
- **THEN** TaskExecutor 跳过任务 B，直接执行依赖 B 的后续任务（或标记 B 为 skipped）

#### Scenario: 追加新任务

- **WHEN** 任务 A 执行后发现需要额外的任务 D
- **THEN** TaskExecutor 将任务 D 动态加入 DAG 并调整依赖关系

### Requirement: 进度回调

TaskExecutor SHALL 支持进度回调，实时通知任务执行状态变化。

#### Scenario: 任务开始回调

- **WHEN** 子任务开始执行
- **THEN** 触发 `onTaskStart(taskId, taskName)` 回调

#### Scenario: 任务完成回调

- **WHEN** 子任务执行完成
- **THEN** 触发 `onTaskEnd(taskId, result)` 回调

#### Scenario: 整体进度回调

- **WHEN** 一个子任务完成
- **THEN** 触发 `onProgress({ completed, total, percentage })` 回调
