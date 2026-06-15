## Context

当前 SDK 提供两层 API：

- **声明式** `createAgent()` — 单 Agent ReAct 循环，单进单出
- **图构建器** `AgentGraph` — 自定义工作流，节点在编译时固定

面对"开发一个管理后台系统"这类复杂需求，需要：

1. LLM 自动将需求拆分为多个子任务
2. 子任务之间有依赖关系（DAG），需要按序或并行执行
3. 每个子任务由独立 Agent 执行，可配置不同的 Skill/工具
4. 任务间需要传递上下文（前一个任务的产出是后一个任务的输入）

核心约束：

- 子任务数量在运行时才确定（Planner LLM 输出决定）
- 需要与现有 `AgentGraph`、`createAgent`、`Skill` 体系无缝集成
- 保持 SDK 的"通用可复用"定位，不绑定特定业务场景

## Goals / Non-Goals

**Goals:**

- 提供高层 API `TaskGraph`，一行代码实现"需求 → 拆分 → 执行 → 汇总"
- 支持任务 DAG 依赖编排，无依赖的任务可并行执行
- 子任务可独立配置 Skill、工具、MCP 服务器
- 任务间通过共享 State 传递上下文
- 失败重试和动态计划调整
- 完全向后兼容，不影响现有 API

**Non-Goals:**

- 不实现分布式任务调度（仅单进程内并行）
- 不提供可视化 DAG 编辑器
- 不支持跨机器任务分发
- 不替代 `AgentGraph`（TaskGraph 是更高层的封装，底层可复用 AgentGraph）

## Decisions

### Decision 1: 任务 DAG 表示 — 结构化 JSON vs 代码定义

**选择**: LLM 输出结构化 JSON，SDK 解析为内部 DAG 对象

**理由**:

- 任务拆分本身就是 LLM 的"推理"能力，用 JSON schema 约束输出格式最自然
- 结构化 JSON 易于序列化、调试、日志记录
- 用户也可以通过代码手动构建 DAG（提供 `TaskDAG` builder API）

**替代方案**: 纯代码定义 DAG → 不够灵活，无法让 LLM 动态生成

### Decision 2: 并行执行策略 — Promise.all vs LangGraph 原生并行

**选择**: 使用 `Promise.all` 在 Node.js 层面实现并行，不依赖 LangGraph 的并行能力

**理由**:

- 当前 `AgentGraph` 基于 LangGraph，其并行支持有限且 API 不稳定
- `Promise.all` 简单直接，每个子任务是独立的 `createAgent().run()` 调用
- 子任务之间天然隔离，不需要共享 LangGraph state
- 更容易实现超时控制和错误隔离

**替代方案**: 扩展 AgentGraph 支持并行分支 → 复杂度高，收益有限

### Decision 3: 上下文传递 — 共享文件系统 vs State 对象 vs 混合

**选择**: 混合模式 — 结构化 State 对象 + 可选的文件系统产出物

**理由**:

- 结构化 State（内存对象）适合传递元数据（如"已创建的模块列表"）
- 文件系统适合传递大量代码内容（如生成的源码文件）
- State 对象作为 `TaskGraphState` 在任务间流转，每个任务可以读写
- 文件路径信息记录在 State 中，实际内容在文件系统

**替代方案**:

- 纯文件系统 → 缺少结构化元数据传递能力
- 纯 State 对象 → 大量代码内容不适合放内存

### Decision 4: 架构分层 — TaskGraph 与 AgentGraph 的关系

**选择**: TaskGraph 是独立的高层抽象，内部使用 `createAgent()` 执行子任务，不依赖 `AgentGraph`

```
┌─────────────────────────────────────┐
│          TaskGraph (高层)            │
│  ┌──────────┐    ┌──────────────┐   │
│  │ Planner  │───▶│ TaskExecutor │   │
│  │ (LLM拆分)│    │  (DAG调度)    │   │
│  └──────────┘    └──────┬───────┘   │
│                         │           │
│              ┌──────────▼────────┐  │
│              │ createAgent() × N │  │
│              │ (每任务独立Agent)  │  │
│              └───────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        AgentGraph (中层，不变)        │
│  自定义工作流，节点编译时固定          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     createAgent (底层，不变)          │
│  声明式 ReAct Agent                  │
└─────────────────────────────────────┘
```

**理由**:

- TaskGraph 的"动态节点 + 并行"需求与 AgentGraph 的"静态编译"模型冲突
- 强行扩展 AgentGraph 会增加复杂度且可能破坏现有功能
- TaskGraph 直接使用 `createAgent()` 更简洁，每个子任务是一个完整 Agent
- AgentGraph 保持不变，保持其简单性

### Decision 5: Planner LLM 输出格式

**选择**: 使用 Zod schema 约束 LLM 输出，确保结构可解析

```typescript
// Planner 输出的结构化任务列表
interface TaskDefinition {
  id: string; // 唯一标识
  name: string; // 任务名称
  description: string; // 任务描述
  dependsOn: string[]; // 依赖的任务 ID 列表
  skill?: string; // 推荐使用的 Skill 名称
  tools?: string[]; // 需要的工具名
  outputFiles?: string[]; // 预期产出文件路径
}
```

**理由**:

- Zod schema 可与 LangChain 的 `withStructuredOutput` 配合，强制 LLM 输出格式
- 类型安全，解析失败有明确错误
- 可扩展（后续加字段不影响旧逻辑）

## Risks / Trade-offs

- **[LLM 拆分质量]** → Planner 的 prompt 工程是关键，需提供高质量 system prompt + few-shot 示例；支持用户自定义 Planner prompt 覆盖默认行为
- **[并行任务冲突]** → 多个子任务同时写文件系统可能冲突 → 约定每个任务有独立的输出目录，或通过任务依赖避免并发写入
- **[上下文窗口限制]** → 复杂项目的 State 可能很大 → State 传递时只传摘要/路径，不传完整内容
- **[执行时间长]** → 多任务串行执行可能很慢 → 并行执行无依赖任务 + 提供 stream 进度回调
- **[LLM 成本]** → 每个子任务都需要一次 LLM 调用 → 提供 `dryRun` 模式，先预览任务列表再执行
