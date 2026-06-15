## ADDED Requirements

### Requirement: TaskPlanner 规划函数

系统 SHALL 提供 `planTasks(requirement, config)` 函数，接收高层需求描述，通过 LLM 分析并生成结构化的任务 DAG。

#### Scenario: 基本需求拆分

- **WHEN** 调用 `planTasks('开发一个用户管理模块', { model: 'gpt-4o-mini' })`
- **THEN** 返回一个 `TaskDAG` 对象，包含多个 `TaskDefinition`，每个任务有唯一 ID、名称、描述和依赖列表

#### Scenario: 带依赖关系的拆分

- **WHEN** 调用 `planTasks('开发管理后台，包含数据模型、API 接口和前端页面')`
- **THEN** 返回的任务 DAG 中，API 接口任务依赖数据模型任务，前端页面任务依赖 API 接口任务

#### Scenario: 无依赖的并行任务

- **WHEN** 调用 `planTasks('同时开发用户模块和订单模块')`
- **THEN** 返回的任务 DAG 中，用户模块和订单模块的任务之间无依赖关系（dependsOn 为空）

### Requirement: Planner 配置

`planTasks` SHALL 接受配置对象，支持自定义模型、提示词和输出格式约束。

#### Scenario: 自定义 Planner 提示词

- **WHEN** 调用 `planTasks(requirement, { model: 'gpt-4', plannerPrompt: '你是一个前端开发专家，只拆分前端相关任务' })`
- **THEN** Planner 使用自定义提示词进行任务拆分

#### Scenario: 自定义任务 Schema

- **WHEN** 调用 `planTasks(requirement, { model: 'gpt-4', taskSchema: customZodSchema })`
- **THEN** Planner 使用自定义 Zod schema 约束 LLM 输出格式

### Requirement: 任务定义结构

每个 `TaskDefinition` SHALL 包含以下字段：id（唯一标识）、name（任务名称）、description（任务描述）、dependsOn（依赖任务 ID 列表）。可选字段包括：skill（推荐 Skill）、tools（工具列表）、outputFiles（预期产出文件）。

#### Scenario: 最小任务定义

- **WHEN** Planner 生成一个简单任务
- **THEN** 任务定义至少包含 id、name、description、dependsOn 四个字段

#### Scenario: 带工具声明的任务

- **WHEN** Planner 识别到某任务需要特定工具（如文件操作）
- **THEN** 任务定义的 tools 字段包含所需工具名称列表

### Requirement: TaskDAG 验证

系统 SHALL 对生成的任务 DAG 进行合法性验证，确保无循环依赖。

#### Scenario: 检测循环依赖

- **WHEN** LLM 输出的任务 DAG 中存在循环依赖（A→B→C→A）
- **THEN** 系统抛出错误，明确指出循环路径

#### Scenario: 验证依赖引用

- **WHEN** 任务的 dependsOn 引用了不存在的任务 ID
- **THEN** 系统抛出错误，指出无效的依赖引用

### Requirement: dryRun 预览模式

系统 SHALL 支持 `dryRun` 模式，仅执行任务拆分而不执行任务。

#### Scenario: 预览任务列表

- **WHEN** 调用 `planTasks(requirement, { model: 'gpt-4', dryRun: true })`
- **THEN** 返回任务 DAG 但不执行任何子任务，用户可预览并决定是否执行
