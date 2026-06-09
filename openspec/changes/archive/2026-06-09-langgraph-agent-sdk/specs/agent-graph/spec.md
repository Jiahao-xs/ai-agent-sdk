## ADDED Requirements

### Requirement: AgentGraph 类
系统 SHALL 提供 `AgentGraph` 类，允许使用者通过链式调用构建自定义执行图。

#### Scenario: 创建空图
- **WHEN** 使用者调用 `new AgentGraph()`
- **THEN** 系统返回一个空的图构建器实例

### Requirement: 添加节点
AgentGraph SHALL 提供 `addNode(name, handler)` 方法，向图中添加处理节点。节点处理函数接收当前状态并返回状态更新。

#### Scenario: 添加 LLM 节点
- **WHEN** 使用者调用 `graph.addNode('agent', async (state) => { ... return { messages: [...] } })`
- **THEN** 图中注册一个名为 'agent' 的节点

#### Scenario: 添加工具执行节点
- **WHEN** 使用者调用 `graph.addNode('tools', toolExecutor)`
- **THEN** 图中注册一个名为 'tools' 的节点

### Requirement: 添加边
AgentGraph SHALL 提供 `addEdge(from, to)` 和 `addConditionalEdge(from, conditionFn)` 方法。

#### Scenario: 添加固定边
- **WHEN** 使用者调用 `graph.addEdge('agent', 'tools')`
- **THEN** 图中添加一条从 'agent' 到 'tools' 的固定边

#### Scenario: 添加条件边
- **WHEN** 使用者调用 `graph.addConditionalEdge('agent', state => state.shouldUseTools ? 'tools' : 'end')`
- **THEN** 图中添加一条从 'agent' 出发的条件边，根据运行时状态决定下一个节点

### Requirement: 图编译
AgentGraph SHALL 提供 `compile()` 方法，将图定义编译为可执行的 LangGraph CompiledGraph。

#### Scenario: 编译有效图
- **WHEN** 使用者调用 `graph.compile()` 且图结构有效
- **THEN** 系统返回一个可执行对象，具有 `invoke()` 和 `stream()` 方法

#### Scenario: 编译无效图
- **WHEN** 使用者调用 `graph.compile()` 但图中存在孤立节点或缺少入口
- **THEN** 系统抛出明确的错误信息，说明图结构问题

### Requirement: 图执行
编译后的图 SHALL 支持 `invoke(input)` 同步执行和 `stream(input)` 流式执行。

#### Scenario: 同步执行
- **WHEN** 使用者调用 `compiledGraph.invoke({ messages: [userMessage] })`
- **THEN** 系统按图的拓扑顺序执行所有节点，返回最终状态

#### Scenario: 流式执行
- **WHEN** 使用者调用 `for await (const chunk of compiledGraph.stream({ messages: [userMessage] }))`
- **THEN** 系统逐节点输出执行结果
