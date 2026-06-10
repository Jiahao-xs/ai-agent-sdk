## ADDED Requirements

### Requirement: transport 字段自动推断

`MCPClientManager.connect()` SHALL 在遍历服务器配置时，对未显式指定 `transport` 的配置项进行自动推断，推断规则如下：

- 配置中包含 `command` 字段 → 推断 `transport` 为 `stdio`
- 配置中包含 `url` 字段且无 `command` → 推断 `transport` 为 `http`

显式指定的 `transport` 字段优先级高于推断结果。

#### Scenario: 省略 transport 的 stdio 配置

- **WHEN** 用户传入配置 `{ command: "uvx", args: ["weather-forecast-server"] }` 且未指定 `transport`
- **THEN** 系统自动推断 `transport` 为 `stdio`，并成功启动 MCP 子进程

#### Scenario: 省略 transport 的 http 配置

- **WHEN** 用户传入配置 `{ url: "https://example.com/mcp" }` 且未指定 `transport`
- **THEN** 系统自动推断 `transport` 为 `http`，并建立 HTTP 连接

#### Scenario: 显式指定 transport 优先

- **WHEN** 用户传入配置 `{ transport: "sse", url: "https://example.com/mcp" }`
- **THEN** 系统使用用户显式指定的 `sse` 传输方式，不进行推断

#### Scenario: 无法推断时抛出错误

- **WHEN** 用户传入配置 `{}` 且未指定 `transport`、`command` 或 `url`
- **THEN** 系统抛出错误，提示用户必须指定 `transport` 或提供 `command`/`url` 字段

### Requirement: 向后兼容

已有显式指定 `transport` 的代码 SHALL 不受影响，推断逻辑仅在 `transport` 字段缺失时触发。

#### Scenario: 旧配置格式继续工作

- **WHEN** 用户传入配置 `{ transport: "stdio", command: "node", args: ["server.js"] }`
- **THEN** 系统行为与变更前完全一致，使用 `stdio` 传输方式
