## ADDED Requirements

### Requirement: web-demo Agent 集成天气 MCP 服务器

web-demo server 端的 `createChatAgent()` SHALL 配置并连接天气 MCP 服务器（`shibing624/weather-forecast-server`），通过 stdio 传输方式运行，使 Agent 具备天气查询工具。

#### Scenario: Agent 创建时连接 MCP 服务器

- **WHEN** web-demo server 启动并调用 `createChatAgent()`
- **THEN** 系统通过 `uvx weather-forecast-server` 启动 MCP 子进程，并将获取到的远程工具与本地工具（calculator、dateTime）合并后传入 Agent

#### Scenario: 用户查询天气

- **WHEN** 用户发送"北京今天天气怎么样"
- **THEN** Agent 调用 MCP 提供的 `get_weather` 工具获取天气数据，并基于返回结果生成自然语言回复

### Requirement: MCP 连接生命周期与服务对齐

`createChatAgent()` SHALL 改为 `async` 函数，在服务启动时调用一次。返回的 `Agent` 实例在服务整个生命周期内复用，服务关闭时调用 `agent.close()` 清理 MCP 连接。

#### Scenario: 服务正常关闭

- **WHEN** web-demo server 收到终止信号（SIGINT/SIGTERM）
- **THEN** 系统调用 `agent.close()` 关闭 MCP 子进程，释放资源后退出

#### Scenario: 多次请求复用 Agent

- **WHEN** 多个用户请求依次到达
- **THEN** 所有请求共用同一个 Agent 实例及其 MCP 连接，无需重复建立连接

### Requirement: MCP 配置硬编码于 agent.ts

web-demo 的 MCP 服务器配置 SHALL 直接写在 `agent.ts` 的 `createChatAgent()` 函数内，不引入额外配置文件。

#### Scenario: 开发者查看 MCP 配置

- **WHEN** 开发者阅读 `examples/web-demo/server/src/agent.ts`
- **THEN** 可直接看到完整的 `mcpServers` 配置对象，包括服务器名称、command、args 等信息
