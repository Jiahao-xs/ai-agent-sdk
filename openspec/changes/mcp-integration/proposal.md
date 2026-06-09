## Why

MCP (Model Context Protocol) 是 Anthropic 推出的开放协议，标准化了 LLM 与外部工具/资源的交互方式。当前 ai-agent-sdk 的工具系统仅支持本地定义的工具（`defineTool`/`BaseTool`），无法接入 MCP 生态中丰富的远程工具服务器（文件系统、数据库、搜索引擎、API 网关等）。集成 MCP Client 能力，让 Agent 能声明式地接入任意 MCP 服务器，大幅扩展工具生态。

## What Changes

- 新增 `mcpServers` 配置项到 `AgentConfig`，支持在创建 Agent 时声明 MCP 服务器连接
- 新增 `src/mcp/` 模块，封装 MCP Client 管理逻辑（连接、获取工具、关闭）
- `createAgent()` 内部自动连接 MCP 服务器、获取远程工具、合并到本地工具列表
- Agent 实例新增 `close()` 方法，用于清理 MCP 连接资源
- 新增 `createMCPClient()` 高级函数，供高级用户独立管理 MCP Client 生命周期
- 新增 `docs/mcp.md` 使用文档，覆盖 MCP 配置、传输方式、示例

## Capabilities

### New Capabilities

- `mcp-client`: MCP Client 集成能力 — 声明式配置 MCP 服务器、自动连接并获取远程工具、合并到 Agent 工具列表、生命周期管理
- `mcp-docs`: MCP 功能使用文档 — 覆盖 stdio/http 传输配置、使用示例、API 参考

### Modified Capabilities

- `agent-factory`: AgentConfig 新增 `mcpServers` 字段，`createAgent()` 内部集成 MCP Client，Agent 接口新增 `close()` 方法

## Impact

- **依赖**: 新增 `@langchain/mcp-adapters`（MCP 适配器），`@modelcontextprotocol/sdk`（MCP 协议核心）
- **代码**: 新增 `src/mcp/` 目录，修改 `src/core/types.ts`、`src/agents/create-agent.ts`、`src/index.ts`
- **API**: AgentConfig 新增可选字段（向后兼容），Agent 接口新增 `close()` 方法（可选调用）
- **文档**: 新增 `docs/mcp.md`
