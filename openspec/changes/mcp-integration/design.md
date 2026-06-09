## Context

ai-agent-sdk 当前提供双层 API：声明式 `createAgent()`（ReAct 模式）和图构建器 `AgentGraph`。工具系统支持 `defineTool`（函数式）和 `BaseTool`（类式），所有工具最终转为 LangChain `StructuredTool`。

MCP 协议通过 `@langchain/mcp-adapters` 的 `MultiServerMCPClient` 可连接 MCP 服务器并获取 `StructuredTool[]`，与现有工具系统天然兼容。本次集成需在 SDK 层面封装这一能力，保持声明式体验。

约束：
- 不破坏现有 API（向后兼容）
- MCP 配置嵌入 `AgentConfig`，用户无需手动管理连接
- 依赖 `@langchain/mcp-adapters`（基于 LangChain 的工具转换）

## Goals / Non-Goals

**Goals:**

- AgentConfig 支持 `mcpServers` 配置，声明式接入 MCP 服务器
- createAgent() 内部自动连接 MCP、获取远程工具、合并到工具列表
- Agent 实例新增 `close()` 方法清理 MCP 连接
- 提供 `createMCPClient()` 高级函数，支持独立生命周期管理
- 同名工具冲突时本地工具优先，打印 warning
- 编写 `docs/mcp.md` 使用文档

**Non-Goals:**

- 不做 MCP Server 方向（暴露 SDK 工具为 MCP 服务）
- 不做 MCP 认证/鉴权（协议层由 adapters 处理）
- 不做 MCP 工具的热更新/动态加载（创建时一次性获取）
- 不做 MCP Resources/Prompts（仅 Tools）

## Decisions

### D1: MCP Client 封装层级

**决策**: 新增 `src/mcp/` 模块，封装 `MCPClientManager` 类。

**理由**: 将 MCP 逻辑隔离到独立模块，避免污染核心 Agent 代码。`MCPClientManager` 负责连接管理、工具获取、关闭清理，`createAgent` 仅调用其接口。

```
src/mcp/
└── index.ts    # MCPClientManager + createMCPClient()
```

### D2: mcpServers 配置格式

**决策**: 直接在 `AgentConfig` 中新增 `mcpServers` 字段，格式与 `MultiServerMCPClient` 的配置一致。

```typescript
interface MCPServerConfig {
  transport: 'stdio' | 'http' | 'sse';
  command?: string;      // stdio
  args?: string[];       // stdio
  url?: string;          // http/sse
  headers?: Record<string, string>; // http
}

interface AgentConfig {
  // ... 现有字段
  mcpServers?: Record<string, MCPServerConfig>;
}
```

**理由**: 配置格式与 `@langchain/mcp-adapters` 的 `MultiServerMCPClient` 一致，零转换成本，用户可直接参考 MCP 文档。

### D3: 工具合并策略

**决策**: 本地工具优先。如果 MCP 远程工具与本地工具同名，保留本地工具，忽略远程工具并打印 warning。

**理由**: 本地工具是用户显式定义的，优先级更高。同名冲突是边界场景，warning 足以提示用户。

### D4: 生命周期管理

**决策**: `createAgent()` 内部创建 `MCPClientManager`，Agent 实例新增可选 `close()` 方法。

```
createAgent(config)
  │
  ├── resolveModel()
  ├── config.tools (本地)
  ├── MCPClientManager.connect(config.mcpServers)
  │     └── 获取远程工具 → 合并到 tools[]
  ├── createReactAgent({ llm, tools })
  │
  └── return Agent { run, stream, close }
        └── close() → MCPClientManager.close()
```

**理由**: 声明式体验 — 用户配置 `mcpServers` 即可，SDK 管理连接。`close()` 是可选的优雅清理，不调用也不会泄漏（adapters 默认无状态模式）。

### D5: 高级模式 — createMCPClient()

**决策**: 导出 `createMCPClient()` 函数，返回 `{ tools, close }` 对象。

```typescript
const { tools, close } = await createMCPClient({
  filesystem: { transport: 'stdio', command: 'npx', args: ['...', '/tmp'] },
});
// tools 可直接传给 AgentGraph 或 createAgent
const agent = createAgent({ model: 'gpt-4o-mini', tools });
await close();
```

**理由**: 高级用户可能需要精细控制 MCP 生命周期，或把 MCP 工具传给 `AgentGraph`。

## Risks / Trade-offs

- **[MCP 连接失败]** MCP 服务器不可达时 `createAgent()` 会抛错。→ 缓解：在文档中说明需要确保 MCP 服务器可用；未来可添加 `lazy` 模式延迟连接。
- **[依赖增加]** `@langchain/mcp-adapters` 引入额外依赖。→ 可接受：MCP 是可选功能，不配置 `mcpServers` 时不会触发连接。
- **[工具发现延迟]** MCP 工具在 `createAgent()` 时一次性获取，运行期间无法动态更新。→ 可接受：当前设计目标是声明式、简单。
