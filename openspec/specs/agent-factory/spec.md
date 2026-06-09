## ADDED Requirements

### Requirement: createAgent 工厂函数
系统 SHALL 提供 `createAgent(config)` 函数，接受配置对象并返回一个可执行的 Agent 实例。该函数 SHALL 封装 LangGraph 的 `createReactAgent`，对使用者屏蔽图编排细节。

#### Scenario: 最简创建
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4' })`
- **THEN** 系统返回一个带有 `run()` 和 `stream()` 方法的 Agent 实例，使用 OpenAI gpt-4 模型

#### Scenario: 带工具创建
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', tools: [tool1, tool2] })`
- **THEN** 系统返回的 Agent 实例在推理过程中能自动调用提供的工具

#### Scenario: 自定义系统提示词
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', prompt: '你是一个翻译助手' })`
- **THEN** 系统返回的 Agent 实例使用自定义提示词作为系统消息

### Requirement: Agent run 方法
Agent 实例 SHALL 提供 `run(input: string)` 方法，执行完整的 ReAct 循环并返回最终结果。

#### Scenario: 简单问答
- **WHEN** 使用者调用 `agent.run('什么是TypeScript')` 且 Agent 未配置工具
- **THEN** 系统直接将问题发送给 LLM，返回 LLM 的文本响应和耗时信息

#### Scenario: 带工具调用
- **WHEN** 使用者调用 `agent.run('计算 (1+2)*3')` 且 Agent 配置了计算器工具
- **THEN** 系统自动执行 ReAct 循环（推理→调用工具→观察结果→再推理），返回最终回答

### Requirement: Agent stream 方法
Agent 实例 SHALL 提供 `stream(input: string, onChunk: callback)` 方法，支持流式输出。

#### Scenario: 流式输出
- **WHEN** 使用者调用 `agent.stream('写一首诗', chunk => console.log(chunk))`
- **THEN** 系统逐步输出 LLM 生成的内容，每次生成一个 token 时触发 onChunk 回调

### Requirement: Agent 配置合并
系统 SHALL 支持合理的默认配置，使用者传入的配置 SHALL 与默认值深度合并。

#### Scenario: 默认配置
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4' })` 未指定 temperature
- **THEN** 系统使用默认 temperature 值 0.7

#### Scenario: 覆盖默认配置
- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', temperature: 0.2 })`
- **THEN** 系统使用 temperature 值 0.2

### Requirement: Agent 最大迭代控制
系统 SHALL 限制 ReAct 循环的最大迭代次数，防止无限循环。

#### Scenario: 达到最大迭代
- **WHEN** Agent 在 ReAct 循环中达到 maxIterations 上限（默认 10）
- **THEN** 系统停止循环并返回当前已有的最佳结果
