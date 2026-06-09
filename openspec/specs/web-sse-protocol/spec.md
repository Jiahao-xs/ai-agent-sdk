## ADDED Requirements

### Requirement: SSE 事件类型定义
系统 SHALL 定义一套前后端共享的 SSE 事件类型和数据格式，确保前后端通信协议一致。

#### Scenario: 事件类型枚举
- **WHEN** 后端发送 SSE 事件
- **THEN** 事件类型 SHALL 为以下之一：`token`、`tool_start`、`tool_end`、`done`、`error`

### Requirement: token 事件格式
当 LLM 生成文本片段时，后端 SHALL 发送 token 事件，携带生成的文本内容。

#### Scenario: 发送 token 事件
- **WHEN** Agent 的 LLM 生成一个文本片段 "你好"
- **THEN** 后端发送 SSE 事件 `event: token\ndata: {"content": "你好"}\n\n`

#### Scenario: 前端接收 token
- **WHEN** 前端接收到 token 事件
- **THEN** 前端将 content 字段追加到当前 AI 消息的文本中

### Requirement: tool_start 事件格式
当 Agent 开始调用工具时，后端 SHALL 发送 tool_start 事件，携带工具名称和参数。

#### Scenario: 发送 tool_start 事件
- **WHEN** Agent 决定调用 calculator 工具，参数为 `{ expression: "(1+2)*3" }`
- **THEN** 后端发送 SSE 事件 `event: tool_start\ndata: {"tool": "calculator", "args": {"expression": "(1+2)*3"}}\n\n`

#### Scenario: 前端显示工具调用中
- **WHEN** 前端接收到 tool_start 事件
- **THEN** 前端显示工具调用指示器，展示工具名称和参数

### Requirement: tool_end 事件格式
当工具调用完成时，后端 SHALL 发送 tool_end 事件，携带工具执行结果。

#### Scenario: 发送 tool_end 事件
- **WHEN** calculator 工具返回结果 "9"
- **THEN** 后端发送 SSE 事件 `event: tool_end\ndata: {"tool": "calculator", "result": "9"}\n\n`

#### Scenario: 前端显示工具结果
- **WHEN** 前端接收到 tool_end 事件
- **THEN** 前端将工具调用指示更新为完成状态，展示工具返回的结果

### Requirement: done 事件格式
当 Agent 完成本轮对话处理时，后端 SHALL 发送 done 事件，携带完整响应和耗时信息。

#### Scenario: 发送 done 事件
- **WHEN** Agent 完成处理，最终输出为 "计算结果是 9"
- **THEN** 后端发送 SSE 事件 `event: done\ndata: {"output": "计算结果是 9", "duration": 1234}\n\n`

#### Scenario: 前端完成状态更新
- **WHEN** 前端接收到 done 事件
- **THEN** 前端关闭 SSE 连接，解除输入框禁用状态，隐藏加载指示器

### Requirement: error 事件格式
当处理过程中发生错误时，后端 SHALL 发送 error 事件，携带错误信息。

#### Scenario: 发送 error 事件
- **WHEN** Agent 处理过程中发生异常
- **THEN** 后端发送 SSE 事件 `event: error\ndata: {"message": "错误描述"}\n\n`

#### Scenario: 前端显示错误
- **WHEN** 前端接收到 error 事件
- **THEN** 前端在消息列表中显示错误提示，解除输入框禁用状态

### Requirement: 共享类型定义
系统 SHALL 在前后端之间共享 SSE 事件类型定义，避免重复定义导致不一致。

#### Scenario: 类型文件共享
- **WHEN** 前端和后端都需要引用 SSE 事件类型
- **THEN** 两者引用同一份类型定义文件（位于 web-demo 根目录的 shared/ 或 types/ 目录）
