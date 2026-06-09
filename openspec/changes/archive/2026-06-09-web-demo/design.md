## Context

本变更在 `examples/web-demo/` 下为 ai-agent-sdk 创建一个完整的 Web 端智能体案例。SDK 核心已规划完成（createAgent、AgentGraph、工具系统等），本案例是 SDK 的首个集成展示。

约束：
- 前后端分离架构，后端 Express + 前端 React/Vite
- 通过 SSE 实现流式通信
- 不影响 SDK 核心代码，仅作为消费方使用 SDK
- 代码规范：共享 .prettierrc，前端独立 .eslintrc（含 React 规则）

## Goals / Non-Goals

**Goals:**

- 提供开箱即用的 Web 智能体交互界面
- 展示 SDK 的 createAgent + 工具调用 + 流式输出能力
- 后端 Express 服务提供 SSE 流式接口
- 前端 React + Vite 实现聊天界面，支持逐字流式显示
- 工具调用过程可视化（显示使用了什么工具、工具结果）
- 前后端均配置 ESLint + Prettier 代码规范
- 提供一键启动脚本，开发者可快速体验

**Non-Goals:**

- 不做用户认证/鉴权
- 不做对话历史持久化（内存存储即可）
- 不做多用户隔离
- 不做移动端适配（桌面端优先）
- 不修改 SDK 核心代码

## Decisions

### D1: 前后端分离 vs 全栈框架

**决策**: 采用前后端分离架构 — Express 后端 + Vite React 前端。

**理由**: 分离架构更清晰地展示 SDK 的服务端集成方式，开发者可以分别查看后端如何调用 SDK、前端如何消费 SSE。全栈框架（如 Next.js）会模糊 SDK 集成边界。

### D2: SSE vs WebSocket

**决策**: 使用 SSE (Server-Sent Events) 进行流式通信。

**理由**: Agent 的输出本质上是单向流式推送，SSE 完美匹配此场景。SSE 基于 HTTP，实现简单，浏览器原生 EventSource API 支持，自动重连。WebSocket 是双向的，对本场景过重。

### D3: SSE 事件协议设计

**决策**: 定义结构化 SSE 事件类型：

```
event: token          → LLM 生成的文本片段
event: tool_start     → 工具开始调用（含工具名称和参数）
event: tool_end       → 工具调用完成（含工具结果）
event: done           → 本轮对话完成
event: error          → 发生错误
```

**理由**: 结构化的事件类型让前端可以精确渲染不同阶段的内容（文本、工具调用状态），比单一的数据流更易处理。

### D4: 前端状态管理

**决策**: 使用 React useState + useReducer，不引入 Redux/Zustand 等外部状态库。

**理由**: Demo 级别应用，状态简单（消息列表、加载状态、输入值），React 内置 hooks 足够。引入外部状态库增加理解成本。

### D5: 代码规范策略

**决策**: 共享项目根目录的 `.prettierrc`，前端和后端各自有独立的 `.eslintrc.js`。

**理由**:
- Prettier 规则与框架无关，统一保证格式一致
- 前端需要 React 特定的 ESLint 规则（hooks 规则、JSX 转换等）
- 后端使用与 SDK 一致的 ESLint 配置

### D6: 目录结构

**决策**:

```
examples/web-demo/
├── server/
│   ├── src/
│   │   ├── index.ts          # Express 入口
│   │   ├── routes/
│   │   │   └── chat.ts       # 聊天路由 (REST + SSE)
│   │   └── agent.ts          # Agent 实例创建
│   ├── .eslintrc.js
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ToolCallIndicator.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts    # SSE 通信 hook
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── app.css
│   ├── .eslintrc.js
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .prettierrc               # 共享 (symlink 或 copy 根目录)
└── package.json              # workspace 脚本 (并发启动前后端)
```

## Risks / Trade-offs

- **[CORS 配置]** 前后端分离需要处理跨域。→ 后端配置 cors 中间件，开发时 Vite proxy 也可解决。
- **[SSE 连接管理]** 浏览器 SSE 连接断开后需重连。→ 使用 EventSource 原生自动重连 + 前端错误提示。
- **[Agent 并发]** 多个用户同时发消息时 Agent 实例的线程安全。→ Demo 场景使用单例 Agent，串行处理即可；后续可改为每请求创建新实例。
- **[样式方案]** 未使用 CSS 框架，手写 CSS 可能不够美观。→ Demo 级别可接受，重点展示功能而非 UI 设计。
