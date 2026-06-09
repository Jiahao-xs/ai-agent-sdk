## 1. 项目结构搭建

- [x] 1.1 创建 examples/web-demo/ 目录结构：server/src/routes/、client/src/components/、client/src/hooks/、client/src/types/、client/src/styles/、shared/
- [x] 1.2 创建 examples/web-demo/package.json，定义 workspace 脚本（并发启动前后端）
- [x] 1.3 创建 examples/web-demo/.prettierrc，复制项目根目录的 Prettier 配置
- [x] 1.4 创建 shared/types.ts，定义 SSE 事件类型接口（SSEEvent、TokenEvent、ToolStartEvent、ToolEndEvent、DoneEvent、ErrorEvent）

## 2. 后端服务

- [x] 2.1 创建 server/package.json，声明依赖（express、cors、dotenv、ai-agent-sdk 路径引用）和开发依赖（typescript、@types/express、@types/cors、eslint、prettier 等）
- [x] 2.2 创建 server/tsconfig.json，配置 TypeScript 编译选项
- [x] 2.3 创建 server/.eslintrc.js，配置 ESLint + @typescript-eslint + prettier
- [x] 2.4 创建 server/src/agent.ts，使用 ai-agent-sdk 的 createAgent 创建 Agent 实例，加载 calculator 和 date_time 工具
- [x] 2.5 创建 server/src/routes/chat.ts，实现 POST /api/chat 路由，调用 Agent 的 stream 方法，将结果通过 SSE 事件（token、tool_start、tool_end、done、error）推送给前端
- [x] 2.6 创建 server/src/index.ts，Express 入口文件，配置 CORS、JSON 解析、挂载路由，监听端口 3001
- [x] 2.7 创建 server/src/routes/health.ts，实现 GET /api/health 健康检查接口

## 3. 前端应用

- [x] 3.1 使用 Vite + React + TypeScript 初始化 client/ 项目（pnpm create vite client --template react-ts）
- [x] 3.2 创建 client/.eslintrc.js，配置 ESLint + React + React Hooks + @typescript-eslint + prettier
- [x] 3.3 配置 client/vite.config.ts，设置开发代理将 /api 转发到 http://localhost:3001
- [x] 3.4 创建 client/src/types/index.ts，从 shared/types.ts 导入或重新定义 SSE 事件类型
- [x] 3.5 创建 client/src/hooks/useChat.ts，封装 SSE 通信逻辑：发送消息、监听事件、更新消息状态、错误处理
- [x] 3.6 创建 client/src/components/ChatInput.tsx，输入框 + 发送按钮组件（支持 Enter 发送、空消息禁用、发送中禁用）
- [x] 3.7 创建 client/src/components/MessageBubble.tsx，消息气泡组件（区分用户消息和 AI 消息样式）
- [x] 3.8 创建 client/src/components/ToolCallIndicator.tsx，工具调用可视化组件（显示工具名称、参数、结果）
- [x] 3.9 创建 client/src/components/MessageList.tsx，消息列表组件（自动滚动到底部）
- [x] 3.10 创建 client/src/components/ChatContainer.tsx，聊天容器组件，组合 MessageList + ChatInput
- [x] 3.11 创建 client/src/App.tsx，应用根组件，使用 ChatContainer
- [x] 3.12 创建 client/src/styles/app.css，聊天界面样式（消息气泡、工具调用指示器、输入区域）

## 4. 启动脚本与联调

- [x] 4.1 在 examples/web-demo/package.json 中配置并发启动脚本：`"dev": "concurrently \"pnpm --filter server dev\" \"pnpm --filter client dev\""`
- [x] 4.2 创建 .env.example，列出需要的环境变量（OPENAI_API_KEY、OPENAI_API_BASE 等）

## 5. 验证与收尾

- [x] 5.1 验证后端服务启动正常，GET /api/health 返回 200
- [x] 5.2 验证前端 Vite 开发服务器启动正常，页面可访问
- [x] 5.3 验证前后端 SSE 通信正常，发送消息后能收到流式响应
- [x] 5.4 验证后端 ESLint 检查通过
- [x] 5.5 验证前端 ESLint 检查通过
- [x] 5.6 验证 Prettier 格式检查通过
