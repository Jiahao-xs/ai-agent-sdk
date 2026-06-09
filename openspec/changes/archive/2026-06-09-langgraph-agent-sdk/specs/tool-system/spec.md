## ADDED Requirements

### Requirement: defineTool 函数式定义
系统 SHALL 提供 `defineTool(config)` 函数，接受工具名称、描述、参数 Schema（zod）和处理函数，返回一个可被 Agent 使用的工具实例。

#### Scenario: 定义无状态工具
- **WHEN** 使用者调用 `defineTool({ name: 'search', description: '搜索', parameters: z.object({ query: z.string() }), execute: async ({ query }) => '...' })`
- **THEN** 系统返回一个符合 LangChain StructuredTool 接口的工具实例

#### Scenario: 工具参数校验
- **WHEN** Agent 调用一个使用 zod schema 定义参数的工具，传入了不符合 schema 的参数
- **THEN** 系统抛出参数校验错误，包含具体的校验失败信息

### Requirement: BaseTool 抽象类
系统 SHALL 提供 `BaseTool` 抽象类，使用者可继承该类并通过实现 `execute` 方法创建有状态工具。

#### Scenario: 继承创建工具
- **WHEN** 使用者定义 `class MyTool extends BaseTool { name = 'my_tool'; ... async execute(params) { ... } }` 并实例化
- **THEN** 系统返回一个符合 LangChain StructuredTool 接口的工具实例

#### Scenario: 有状态工具
- **WHEN** 使用者在 BaseTool 子类中定义私有字段和构造函数
- **THEN** 工具实例能正确维护内部状态，多次调用间状态保持

### Requirement: 工具注册表
系统 SHALL 提供工具注册表，支持注册、查询和批量获取工具。

#### Scenario: 注册工具
- **WHEN** 使用者调用 `registry.register(myTool)`
- **THEN** 工具被注册表收录，可通过名称查询

#### Scenario: 按名称获取
- **WHEN** 使用者调用 `registry.get('search')`
- **THEN** 系统返回对应的工具实例，不存在则返回 undefined

#### Scenario: 获取所有工具
- **WHEN** 使用者调用 `registry.getAll()`
- **THEN** 系统返回所有已注册工具的数组

### Requirement: 内置示例工具
系统 SHALL 内置 2-3 个示例工具，供学习和测试使用。

#### Scenario: 计算器工具
- **WHEN** Agent 调用内置的 `calculator` 工具，传入表达式 `'(1+2)*3'`
- **THEN** 工具返回计算结果 `9`

#### Scenario: 日期时间工具
- **WHEN** Agent 调用内置的 `date_time` 工具
- **THEN** 工具返回当前日期时间字符串
