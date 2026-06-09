## MODIFIED Requirements

### Requirement: createAgent 工厂函数
系统 SHALL 提供 `createAgent(config)` 函数，接受配置对象并返回一个可执行的 Agent 实例。该函数 SHALL 封装 LangGraph 的 `createReactAgent`，对使用者屏蔽图编排细节。`AgentConfig` SHALL 支持可选的 `mcpServers` 字段，当配置时系统 SHALL 自动连接 MCP 服务器并将远程工具合并到工具列表。

#### Scenario: 最简创建
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4' })`
- **THEN** 系统返回一个带有 `run()`、`stream()` 和 `close()` 方法的 Agent 实例，使用 OpenAI gpt-4 模型

#### Scenario: 带工具创建
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', tools: [tool1, tool2] })`
- **THEN** 系统返回的 Agent 实例在推理过程中能自动调用提供的工具

#### Scenario: 自定义系统提示词
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', prompt: '你是一个翻译助手' })`
- **THEN** 系统返回的 Agent 实例使用自定义提示词作为系统消息

#### Scenario: 带 MCP 服务器创建
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', mcpServers: { fs: { transport: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'] } } })`
- **THEN** 系统 SHALL 连接 MCP 服务器，获取远程工具，合并到 Agent 工具列表，返回的 Agent 可同时使用本地工具和 MCP 远程工具

## ADDED Requirements

### Requirement: Agent close 方法
Agent 实例 SHALL 提供 `close()` 方法，用于清理 MCP 连接资源。未配置 MCP 时调用 SHALL 为 no-op。

#### Scenario: 关闭 MCP 连接
- **WHEN** Agent 配置了 `mcpServers` 且调用 `await agent.close()`
- **THEN** 系统关闭所有 MCP 连接，释放资源

#### Scenario: 未配置 MCP 时关闭
- **WHEN** Agent 未配置 `mcpServers` 且调用 `await agent.close()`
- **THEN** 系统不执行任何操作，不抛错
