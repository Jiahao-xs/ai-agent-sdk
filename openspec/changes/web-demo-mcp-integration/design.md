## Context

当前 SDK 的 `MCPServerConfig` 要求用户显式指定 `transport` 字段（`stdio`/`http`/`sse`），但标准 MCP 配置格式（如 Claude Desktop、Cursor 等使用的格式）不包含 `transport` 字段，而是通过 `command` 或 `url` 字段隐式表达传输方式。

web-demo 的 `createChatAgent()` 目前只传入本地工具，未使用 SDK 已支持的 `mcpServers` 参数。

## Goals / Non-Goals

**Goals:**

- web-demo 能通过 MCP 连接天气查询服务，展示完整的 MCP 工具集成效果
- SDK 兼容标准 MCP 配置格式，用户无需学习 `transport` 字段即可接入
- MCP 连接生命周期与 web-demo 服务生命周期对齐

**Non-Goals:**

- 不实现 MCP 热重载（服务运行中动态增删 MCP 服务器）
- 不实现 MCP 连接池或多实例复用
- 不为 web-demo 前端增加 MCP 配置 UI

## Decisions

### 1. SDK transport 推断逻辑

**决策**：在 `MCPClientManager.connect()` 中增加推断层，在遍历配置时自动补全 `transport`。

推断规则：

- 有 `command` 字段，无 `transport` → 推断为 `stdio`
- 有 `url` 字段，无 `transport` → 推断为 `http`（默认）或 `sse`

**理由**：推断逻辑简单且确定性高，不会引入歧义；向后兼容（显式指定 `transport` 时优先使用）。

**替代方案**：在 `createAgent` 层做推断 → 拒绝，因为推断逻辑属于 MCP 模块职责，不应泄漏到 Agent 层。

### 2. web-demo MCP 配置方式

**决策**：在 `agent.ts` 中硬编码 MCP 配置（直接写入 `mcpServers` 对象），不引入额外配置文件。

**理由**：

- web-demo 是演示项目，配置简洁直观更重要
- 避免引入 JSON 配置文件解析逻辑
- 用户阅读 `agent.ts` 即可了解完整接入方式

**替代方案**：通过 `.env` 或 `mcp-config.json` 配置 → 拒绝，因为 `.env` 不适合存嵌套结构，JSON 文件增加复杂度。

### 3. MCP 连接生命周期管理

**决策**：`createChatAgent()` 改为 `async` 函数，在服务启动时调用一次，返回的 `Agent` 实例在整个服务生命周期内复用，服务关闭时调用 `agent.close()` 清理 MCP 连接。

**理由**：MCP 连接建立有开销（启动子进程），每次请求重新连接会导致严重延迟。

## Risks / Trade-offs

- **[uvx 依赖]** → web-demo 运行需要系统安装 `uv`，在 README 或 `.env.example` 中说明安装方式
- **[MCP 子进程崩溃]** → `MultiServerMCPClient` 内部处理了子进程异常，SDK 层无需额外处理；但 Agent 会在缺少 MCP 工具的情况下降级运行
- **[transport 推断歧义]** → `url` 字段无法区分 `http` 和 `sse`，默认推断为 `http`；用户若需 `sse` 仍需显式指定
