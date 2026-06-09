## ADDED Requirements

### Requirement: 聊天界面布局
前端 SHALL 提供一个完整的聊天界面，包含顶部标题栏、中间消息区域和底部输入区域。

#### Scenario: 页面加载
- **WHEN** 用户访问前端页面
- **THEN** 显示聊天界面，包含欢迎消息和空输入框

### Requirement: 消息发送
前端 SHALL 提供输入框和发送按钮，用户可以输入消息并发送。

#### Scenario: 发送消息
- **WHEN** 用户在输入框输入文字并点击发送按钮（或按 Enter）
- **THEN** 消息显示在消息列表中（用户气泡），输入框清空，显示加载状态

#### Scenario: 空消息禁止发送
- **WHEN** 输入框为空时用户尝试发送
- **THEN** 发送按钮禁用，不发送空消息

#### Scenario: 发送中禁止重复发送
- **WHEN** Agent 正在处理上一条消息时
- **THEN** 发送按钮和输入框禁用，直到当前响应完成

### Requirement: 流式消息显示
前端 SHALL 通过 SSE 接收 Agent 的流式响应，逐字显示 AI 回复内容。

#### Scenario: 逐字显示
- **WHEN** SSE 接收到 token 事件
- **THEN** 对应 AI 消息气泡中的文本逐步增长，实现打字机效果

#### Scenario: 自动滚动
- **WHEN** 新内容到达时
- **THEN** 消息列表自动滚动到底部，用户可以看到最新内容

### Requirement: 工具调用可视化
前端 SHALL 在消息流中可视化展示 Agent 的工具调用过程。

#### Scenario: 工具调用开始
- **WHEN** SSE 接收到 tool_start 事件
- **THEN** 在消息流中显示工具调用指示器（如 "正在使用工具: calculator..."）

#### Scenario: 工具调用完成
- **WHEN** SSE 接收到 tool_end 事件
- **THEN** 工具调用指示器更新为完成状态，显示工具返回的结果

### Requirement: 错误处理
前端 SHALL 处理 SSE 连接错误和网络异常，给用户友好的错误提示。

#### Scenario: SSE 连接错误
- **WHEN** SSE 连接中断或发生错误
- **THEN** 显示错误提示消息，用户可以重试

#### Scenario: 服务端错误
- **WHEN** SSE 接收到 error 事件
- **THEN** 在消息列表中显示错误信息

### Requirement: Vite 开发配置
前端 SHALL 使用 Vite 作为开发服务器和构建工具，配置代理将 /api 请求转发到后端。

#### Scenario: 开发代理
- **WHEN** 开发模式下前端发送 `/api/chat` 请求
- **THEN** Vite 将请求代理到后端 `http://localhost:3001`

#### Scenario: 生产构建
- **WHEN** 运行 `pnpm run build`
- **THEN** Vite 输出优化后的静态文件到 dist/ 目录

### Requirement: 前端代码规范
前端 SHALL 配置 ESLint（含 React/React Hooks 规则）+ 共享 Prettier。

#### Scenario: lint 检查通过
- **WHEN** 在 client/ 目录运行 `pnpm run lint`
- **THEN** ESLint 检查通过，无错误

#### Scenario: 格式统一
- **WHEN** 运行 `pnpm run format:check`
- **THEN** 代码格式与项目根目录 .prettierrc 一致
