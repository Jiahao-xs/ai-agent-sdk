## ADDED Requirements

### Requirement: 字符串模式创建 LLM
系统 SHALL 支持传入字符串作为模型名称，自动使用 OpenAI 提供商创建 ChatModel 实例。

#### Scenario: 快捷字符串创建
- **WHEN** 使用者传入 `model: 'gpt-4'`
- **THEN** 系统创建 `ChatOpenAI({ modelName: 'gpt-4' })` 实例，使用环境变量中的 API Key

### Requirement: 配置对象模式创建 LLM
系统 SHALL 支持传入配置对象，指定提供商、模型名称和其他参数来创建 ChatModel 实例。

#### Scenario: OpenAI 配置对象
- **WHEN** 使用者传入 `model: { provider: 'openai', name: 'gpt-4', temperature: 0.5, apiKey: 'sk-...' }`
- **THEN** 系统创建对应配置的 ChatOpenAI 实例

#### Scenario: 配置对象带 basePath
- **WHEN** 使用者传入 `model: { provider: 'openai', name: 'gpt-4', basePath: 'https://custom-api.example.com/v1' }`
- **THEN** 系统创建使用自定义 API 端点的 ChatOpenAI 实例

### Requirement: LangChain 实例透传
系统 SHALL 支持直接传入 LangChain ChatModel 实例，不做任何转换直接使用。

#### Scenario: 传入 ChatOpenAI 实例
- **WHEN** 使用者传入 `model: new ChatOpenAI({ modelName: 'gpt-4', temperature: 0.3 })`
- **THEN** 系统直接使用该实例，不创建新对象

#### Scenario: 传入其他提供商实例
- **WHEN** 使用者传入 `model: new ChatAnthropic({ model: 'claude-3' })`
- **THEN** 系统直接使用该实例，支持非 OpenAI 提供商

### Requirement: 类型推导
系统 SHALL 通过 TypeScript 类型定义，为三种传参模式提供准确的类型提示和自动补全。

#### Scenario: 字符串类型提示
- **WHEN** 使用者在 IDE 中输入 `model: '`
- **THEN** IDE 自动补全常见模型名称（gpt-4, gpt-3.5-turbo 等）

#### Scenario: 配置对象类型约束
- **WHEN** 使用者传入配置对象 `model: { provider: 'openai', ... }`
- **THEN** TypeScript 编译器要求提供必要的字段，并对 provider 值进行枚举约束
