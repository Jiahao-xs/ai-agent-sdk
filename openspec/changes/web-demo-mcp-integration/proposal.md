## Why

web-demo 当前仅内置了计算器和日期时间两个本地工具，无法展示 SDK 的 MCP 集成能力。接入一个真实的 MCP 服务器（天气预报）可以完整演示 SDK 的 MCP 工具扩展链路，同时优化 SDK 的 MCP 配置体验，降低用户接入成本。

## What Changes

- **web-demo server 接入 MCP 服务器**：在 `createChatAgent()` 中配置并连接天气 MCP 服务器（`shibing624/weather-forecast-server`，通过 `uvx` 运行，stdio 传输），使 Agent 具备天气查询能力
- **SDK MCPServerConfig 支持 transport 自动推断**：当配置中包含 `command` 字段但未指定 `transport` 时，自动推断为 `stdio`；包含 `url` 字段时推断为 `http`，减少用户配置负担
- **web-demo 环境依赖说明**：在 `.env.example` 或文档中补充 `uv`/`uvx` 的安装说明

## Capabilities

### New Capabilities

- `web-mcp-integration`: web-demo server 端 MCP 集成，包括配置管理、Agent 创建时传入 mcpServers、以及服务关闭时清理 MCP 连接
- `mcp-transport-inference`: SDK 层 MCPServerConfig transport 字段自动推断，支持省略 transport 时从 command/url 字段智能推断传输方式

### Modified Capabilities

<!-- 无需修改现有 spec 的需求层面行为 -->

## Impact

- **代码**：`examples/web-demo/server/src/agent.ts`（新增 mcpServers 配置）、`src/mcp/index.ts`（新增 transport 推断逻辑）
- **依赖**：web-demo 运行时需要系统安装 `uv`/`uvx`（Python 包管理工具）
- **API**：无变化，SDK 对外接口保持不变
- **配置**：web-demo `.env` 或新增 `mcp-config.json` 用于 MCP 服务器配置
