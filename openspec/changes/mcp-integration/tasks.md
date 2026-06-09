## 1. 依赖安装

- [x] 1.1 安装 `@langchain/mcp-adapters` 和 `@modelcontextprotocol/sdk` 依赖
- [x] 1.2 验证依赖安装成功，确认 `pnpm list` 输出包含新依赖

## 2. MCP 核心模块

- [x] 2.1 创建 `src/mcp/index.ts`，定义 `MCPServerConfig` 接口（transport、command、args、url、headers）
- [x] 2.2 实现 `MCPClientManager` 类：`connect(servers)` 方法 — 使用 `MultiServerMCPClient` 连接 MCP 服务器并返回 `StructuredTool[]`
- [x] 2.3 实现 `MCPClientManager.close()` 方法 — 关闭所有 MCP 连接
- [x] 2.4 实现工具合并逻辑 — 本地工具优先，同名工具打印 `console.warn` 并忽略远程工具
- [x] 2.5 导出 `createMCPClient(servers)` 函数 — 返回 `{ tools, close }` 对象，供高级用户独立使用

## 3. Agent 集成

- [x] 3.1 修改 `src/core/types.ts`：`AgentConfig` 新增可选 `mcpServers: Record<string, MCPServerConfig>` 字段
- [x] 3.2 修改 `src/core/types.ts`：`Agent` 接口新增 `close(): Promise<void>` 方法
- [x] 3.3 修改 `src/agents/create-agent.ts`：在 `createAgent()` 中集成 MCP — 当 `mcpServers` 存在时创建 `MCPClientManager`，获取远程工具，合并到 `config.tools`
- [x] 3.4 修改 `src/agents/create-agent.ts`：实现 `agent.close()` — 调用内部 `MCPClientManager.close()`，未配置 MCP 时为 no-op
- [x] 3.5 修改 `src/index.ts`：导出 `MCPServerConfig`、`createMCPClient` 类型和函数

## 4. 代码质量

- [x] 4.1 运行 ESLint 检查并修复所有错误：`pnpm lint --fix`
- [x] 4.2 运行 Prettier 格式化：`pnpm format`
- [x] 4.3 运行 TypeScript 编译检查：`pnpm build`

## 5. 使用文档

- [x] 5.1 创建 `docs/mcp.md`：快速开始部分 — 包含完整的 stdio 传输配置示例
- [x] 5.2 创建 `docs/mcp.md`：传输方式部分 — 分别说明 stdio、http、sse 的配置格式和使用场景
- [x] 5.3 创建 `docs/mcp.md`：API 参考部分 — 列出 `MCPServerConfig`、`MCPClientManager`、`createMCPClient()`、`AgentConfig.mcpServers`、`Agent.close()` 的签名和参数
- [x] 5.4 创建 `docs/mcp.md`：工具冲突处理部分 — 说明本地工具优先策略
