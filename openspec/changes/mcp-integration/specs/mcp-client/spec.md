## ADDED Requirements

### Requirement: MCP Server 配置类型
系统 SHALL 提供 `MCPServerConfig` 接口，支持 stdio、http、sse 三种传输方式。

#### Scenario: stdio 传输配置
- **WHEN** 用户配置 `{ transport: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'] }`
- **THEN** 系统 SHALL 通过 stdio 方式启动 MCP 子进程并连接

#### Scenario: http 传输配置
- **WHEN** 用户配置 `{ transport: 'http', url: 'http://localhost:3000/mcp', headers: { 'Authorization': 'Bearer xxx' } }`
- **THEN** 系统 SHALL 通过 HTTP 方式连接远程 MCP 服务器

#### Scenario: sse 传输配置
- **WHEN** 用户配置 `{ transport: 'sse', url: 'http://localhost:3000/sse' }`
- **THEN** 系统 SHALL 通过 SSE 方式连接远程 MCP 服务器

### Requirement: AgentConfig 支持 mcpServers
`AgentConfig` SHALL 新增可选字段 `mcpServers: Record<string, MCPServerConfig>`，用于声明式配置 MCP 服务器连接。

#### Scenario: 无 MCP 配置时行为不变
- **WHEN** 用户调用 `createAgent({ model: 'gpt-4o-mini', tools: [myTool] })` 不包含 `mcpServers`
- **THEN** 系统 SHALL 正常创建 Agent，不触发任何 MCP 连接，行为与现有逻辑完全一致

#### Scenario: 配置单个 MCP 服务器
- **WHEN** 用户调用 `createAgent({ model: 'gpt-4o-mini', mcpServers: { fs: { transport: 'stdio', command: 'npx', args: ['...', '/tmp'] } } })`
- **THEN** 系统 SHALL 连接 MCP 服务器，获取远程工具，并将远程工具合并到 Agent 的工具列表中

#### Scenario: 配置多个 MCP 服务器
- **WHEN** 用户配置多个 MCP 服务器
- **THEN** 系统 SHALL 依次连接所有 MCP 服务器，合并所有远程工具到工具列表

### Requirement: MCPClientManager 连接管理
系统 SHALL 提供 `MCPClientManager` 类，负责 MCP 服务器的连接、工具获取和关闭。

#### Scenario: 连接并获取工具
- **WHEN** 调用 `MCPClientManager.connect(servers)` 且连接成功
- **THEN** SHALL 返回所有远程工具的 `StructuredTool[]` 数组

#### Scenario: 关闭连接
- **WHEN** 调用 `MCPClientManager.close()`
- **THEN** SHALL 关闭所有 MCP 服务器连接，释放资源

### Requirement: 工具合并与冲突处理
当 MCP 远程工具与本地工具同名时，系统 SHALL 保留本地工具，忽略远程工具，并打印 warning 日志。

#### Scenario: 无冲突合并
- **WHEN** 本地工具 `['calc', 'datetime']` 与远程工具 `['read_file', 'write_file']` 无同名
- **THEN** 最终工具列表 SHALL 为 `['calc', 'datetime', 'read_file', 'write_file']`

#### Scenario: 同名冲突处理
- **WHEN** 本地工具 `['calc']` 与远程工具 `['calc']` 同名
- **THEN** 最终工具列表 SHALL 保留本地 `calc`，忽略远程 `calc`，并输出 `console.warn` 提示冲突

### Requirement: Agent 实例 close 方法
Agent 接口 SHALL 新增可选 `close()` 方法，用于清理 MCP 连接资源。

#### Scenario: 调用 close 清理资源
- **WHEN** Agent 配置了 `mcpServers` 且调用 `agent.close()`
- **THEN** SHALL 关闭内部 `MCPClientManager`，释放所有 MCP 连接

#### Scenario: 未配置 MCP 时 close 为 no-op
- **WHEN** Agent 未配置 `mcpServers` 且调用 `agent.close()`
- **THEN** SHALL 不执行任何操作，不抛错

### Requirement: createMCPClient 高级函数
系统 SHALL 导出 `createMCPClient(servers)` 函数，返回 `{ tools: StructuredTool[], close: () => Promise<void> }` 对象。

#### Scenario: 独立使用 createMCPClient
- **WHEN** 用户调用 `const { tools, close } = await createMCPClient({ fs: { transport: 'stdio', ... } })`
- **THEN** SHALL 返回远程工具数组和关闭函数，用户可自行管理生命周期

#### Scenario: createMCPClient 工具传给 AgentGraph
- **WHEN** 用户将 `tools` 传给 `AgentGraph` 的 `addTools()`
- **THEN** AgentGraph SHALL 正常使用这些远程工具
