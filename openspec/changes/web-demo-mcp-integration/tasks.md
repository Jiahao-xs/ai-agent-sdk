## 1. SDK transport 自动推断

- [x] 1.1 在 `src/mcp/index.ts` 的 `MCPClientManager.connect()` 中，为配置遍历循环增加 transport 推断逻辑：有 `command` 无 `transport` → `stdio`；有 `url` 无 `transport` 无 `command` → `http`
- [x] 1.2 当 `transport`、`command`、`url` 均缺失时，抛出明确错误提示
- [x] 1.3 将 `MCPServerConfig` 的 `transport` 字段改为可选（`transport?: MCPTransport`）
- [x] 1.4 运行 typecheck 确认无类型错误

## 2. web-demo MCP 集成

- [x] 2.1 将 `examples/web-demo/server/src/agent.ts` 中的 `createChatAgent()` 改为 `async` 函数
- [x] 2.2 在 `createChatAgent()` 中添加 `mcpServers` 配置，接入 `weather-forecast-server`（`command: "uvx"`, `args: ["weather-forecast-server"]`，省略 `transport` 以验证推断逻辑）
- [x] 2.3 更新 `examples/web-demo/server/src/index.ts`，`await createChatAgent()` 并在服务关闭时调用 `agent.close()`
- [x] 2.4 更新 Agent 的 system prompt，补充天气查询能力说明

## 3. 验证与文档

- [ ] 3.1 本地启动 web-demo server，验证 MCP 连接成功建立（日志输出工具列表包含 `get_weather`）
- [ ] 3.2 通过前端发送天气查询消息，验证 Agent 能调用工具并返回天气信息
- [x] 3.3 在 `examples/web-demo/.env.example` 中补充 `uv`/`uvx` 安装说明注释
