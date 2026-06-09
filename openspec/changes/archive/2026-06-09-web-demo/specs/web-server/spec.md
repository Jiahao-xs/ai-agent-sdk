## ADDED Requirements

### Requirement: Express 服务启动
系统 SHALL 提供一个 Express 服务作为 Web Demo 的后端，监听可配置端口（默认 3001），并配置 CORS 允许前端跨域访问。

#### Scenario: 正常启动
- **WHEN** 运行 `pnpm run dev` 启动后端服务
- **THEN** Express 服务在端口 3001 启动，控制台输出服务地址

#### Scenario: CORS 配置
- **WHEN** 前端（localhost:5173）发送请求到后端
- **THEN** 后端正确响应，无 CORS 错误

### Requirement: 聊天接口
后端 SHALL 提供 `POST /api/chat` 接口，接收用户消息，调用 ai-agent-sdk 的 Agent 处理，并通过 SSE 流式返回结果。

#### Scenario: 发送消息
- **WHEN** 前端发送 `POST /api/chat` 请求，body 为 `{ message: "你好" }`
- **THEN** 后端返回 `Content-Type: text/event-stream` 的 SSE 响应流

#### Scenario: Agent 处理
- **WHEN** 后端收到用户消息
- **THEN** 后端调用 ai-agent-sdk 的 createAgent 创建的 Agent 实例处理消息

### Requirement: 健康检查接口
后端 SHALL 提供 `GET /api/health` 接口，返回服务状态。

#### Scenario: 健康检查
- **WHEN** 访问 `GET /api/health`
- **THEN** 返回 `{ status: "ok" }` 和 200 状态码

### Requirement: Agent 集成
后端 SHALL 使用 ai-agent-sdk 的 createAgent 创建 Agent 实例，并加载内置工具。

#### Scenario: Agent 初始化
- **WHEN** 后端服务启动时
- **THEN** 使用 createAgent 创建 Agent 实例，配置 calculator 和 date_time 工具

#### Scenario: 工具调用透传
- **WHEN** Agent 在处理消息过程中调用工具
- **THEN** 后端通过 SSE 事件将工具调用信息（tool_start、tool_end）推送给前端

### Requirement: 后端代码规范
后端 SHALL 配置 ESLint + Prettier，与 SDK 核心保持一致的代码风格。

#### Scenario: lint 检查通过
- **WHEN** 在 server/ 目录运行 `pnpm run lint`
- **THEN** ESLint 检查通过，无错误
