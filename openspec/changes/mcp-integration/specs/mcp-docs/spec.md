## ADDED Requirements

### Requirement: MCP 使用文档
系统 SHALL 在 `docs/mcp.md` 提供完整的 MCP 功能使用文档。

#### Scenario: 文档覆盖快速开始
- **WHEN** 用户阅读 `docs/mcp.md` 的快速开始部分
- **THEN** 文档 SHALL 包含一个完整的 stdio 传输配置示例，用户可直接复制使用

#### Scenario: 文档覆盖传输方式
- **WHEN** 用户阅读传输方式部分
- **THEN** 文档 SHALL 分别说明 stdio、http、sse 三种传输的配置格式和使用场景

#### Scenario: 文档覆盖 API 参考
- **WHEN** 用户阅读 API 参考部分
- **THEN** 文档 SHALL 列出 `MCPServerConfig`、`MCPClientManager`、`createMCPClient()`、`AgentConfig.mcpServers`、`Agent.close()` 的 API 签名和参数说明

#### Scenario: 文档覆盖工具冲突处理
- **WHEN** 用户阅读工具冲突处理部分
- **THEN** 文档 SHALL 说明本地工具优先策略及如何识别和解决冲突
