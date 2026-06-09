# MCP 集成使用文档

ai-agent-sdk 支持通过 MCP (Model Context Protocol) 协议连接外部工具服务器，让 Agent 能够使用远程工具扩展能力。

## 快速开始

```typescript
import { createAgent } from 'ai-agent-sdk';

const agent = await createAgent({
  model: 'gpt-4o-mini',
  mcpServers: {
    // 连接文件系统 MCP 服务器
    filesystem: {
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    },
  },
});

const result = await agent.run('读取 /tmp/test.txt 的内容');
console.log(result.output);

// 使用完毕后关闭 MCP 连接
await agent.close();
```

## 传输方式

MCP 支持三种传输方式，根据服务器类型选择：

### stdio（子进程）

通过启动本地子进程通信，适合本地 MCP 服务器：

```typescript
{
  transport: 'stdio',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/dir'],
}
```

**适用场景**：本地开发、单机部署、官方 MCP 服务器

### http（HTTP 请求）

通过 HTTP 请求通信，适合远程 MCP 服务器：

```typescript
{
  transport: 'http',
  url: 'http://localhost:3000/mcp',
  headers: {
    'Authorization': 'Bearer your-token',
  },
}
```

**适用场景**：远程服务、微服务架构、需要认证的场景

### sse（Server-Sent Events）

通过 SSE 流式通信，适合需要实时推送的 MCP 服务器：

```typescript
{
  transport: 'sse',
  url: 'http://localhost:3000/sse',
}
```

**适用场景**：实时通信、长连接场景

## 多服务器配置

可以同时连接多个 MCP 服务器，所有远程工具会自动合并到 Agent：

```typescript
const agent = await createAgent({
  model: 'gpt-4o-mini',
  tools: [calculatorTool], // 本地工具
  mcpServers: {
    filesystem: {
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    },
    database: {
      transport: 'http',
      url: 'http://localhost:5000/mcp',
    },
  },
});

// Agent 现在可以同时使用：
// - calculatorTool（本地）
// - filesystem 的所有远程工具
// - database 的所有远程工具
```

## 工具冲突处理

当 MCP 远程工具与本地工具同名时，**本地工具优先**，远程工具会被忽略并打印 warning：

```
[MCP] 工具名称冲突: "calc" — 保留本地工具，忽略远程工具
```

如果需要同时使用两个同名工具，请重命名其中一个。

## 高级用法：独立 MCP Client

如果需要精细控制 MCP 生命周期，或把 MCP 工具传给 `AgentGraph`，可以使用 `createMCPClient()`：

```typescript
import { createMCPClient, AgentGraph } from 'ai-agent-sdk';

// 创建独立的 MCP Client
const { tools, close } = await createMCPClient({
  filesystem: {
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
  },
});

// 方式 1：传给 AgentGraph
const graph = new AgentGraph()
  .addLLMNode('agent', model, tools)
  // ...

// 方式 2：传给 createAgent
const agent = await createAgent({
  model: 'gpt-4o-mini',
  tools, // MCP 工具
});

// 手动关闭
await close();
```

## API 参考

### `MCPServerConfig`

MCP 服务器配置接口：

```typescript
interface MCPServerConfig {
  /** 传输方式 */
  transport: 'stdio' | 'http' | 'sse';
  /** stdio 命令（仅 stdio） */
  command?: string;
  /** stdio 参数（仅 stdio） */
  args?: string[];
  /** 远程 URL（仅 http/sse） */
  url?: string;
  /** HTTP 请求头（仅 http） */
  headers?: Record<string, string>;
}
```

### `MCPClientManager`

MCP Client 管理器类：

```typescript
class MCPClientManager {
  /** 连接 MCP 服务器并获取远程工具 */
  connect(servers: Record<string, MCPServerConfig>): Promise<StructuredToolInterface[]>;

  /** 关闭所有 MCP 连接 */
  close(): Promise<void>;
}
```

### `createMCPClient()`

创建独立的 MCP Client：

```typescript
function createMCPClient(
  servers: Record<string, MCPServerConfig>,
): Promise<{
  tools: StructuredToolInterface[];
  close: () => Promise<void>;
}>;
```

### `AgentConfig.mcpServers`

Agent 配置中的 MCP 服务器字段（可选）：

```typescript
interface AgentConfig {
  // ... 其他字段
  mcpServers?: Record<string, MCPServerConfig>;
}
```

### `Agent.close()`

清理 MCP 连接资源。未配置 MCP 时调用为 no-op：

```typescript
interface Agent {
  // ... 其他方法
  close(): Promise<void>;
}
```

## 依赖

MCP 功能需要以下依赖：

```bash
pnpm add @langchain/mcp-adapters @modelcontextprotocol/sdk
```

不配置 `mcpServers` 时不会触发 MCP 连接，无需额外依赖。
