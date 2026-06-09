## Why

ai-agent-sdk 作为一个通用可复用 SDK，目前只有 CLI 示例，缺少一个直观的 Web 端交互式案例。第三方开发者在评估 SDK 时，往往需要一个可视化的 Demo 来快速理解 Agent 的实际运行效果（流式输出、工具调用过程等）。一个完整的 Web 案例不仅能展示 SDK 的核心能力，还能作为集成参考，帮助开发者在自己的项目中快速接入。

## What Changes

- 在 `examples/web-demo/` 下新建前后端分离的 Web 智能体案例
- **后端**: Express 服务，集成 ai-agent-sdk，提供 SSE 流式接口
- **前端**: React + Vite 构建的聊天界面，通过 SSE 接收流式响应
- 支持对话交互、流式输出逐字显示、工具调用过程可视化
- 前端配置独立的 ESLint（含 React 规则），共享项目根目录的 .prettierrc
- 后端配置与 SDK 一致的 ESLint + Prettier 规范

## Capabilities

### New Capabilities

- `web-server`: Express 后端服务，集成 ai-agent-sdk 的 createAgent，提供 REST + SSE 接口，处理用户消息并流式返回 Agent 响应
- `web-client`: React + Vite 前端聊天界面，包含消息列表、流式显示、工具调用可视化、输入框等组件
- `web-sse-protocol`: 前后端 SSE 通信协议定义，包括事件类型（token、tool_start、tool_end、done、error）和数据格式规范

### Modified Capabilities

（无，这是新增案例，不修改 SDK 核心代码）

## Impact

- **依赖**: 新增 `express`、`cors`、`react`、`react-dom`、`vite`、`@vitejs/plugin-react`、`eslint-plugin-react`、`eslint-plugin-react-hooks` 等
- **代码**: 仅新增 `examples/web-demo/` 目录，不影响 SDK 核心源码
- **API**: 新增 HTTP 接口（POST /api/chat、GET /api/health），均为 Demo 级别
- **系统**: 需要 Node.js >= 18，pnpm >= 8，浏览器支持 SSE 和 EventSource
