## ADDED Requirements

### Requirement: AgentConfig skills 字段

`AgentConfig` SHALL 新增可选字段 `skills: Skill[]` 和 `toolPool?: StructuredToolInterface[]`。skills SHALL 接受文件加载的 Skill 对象和内联 Skill 对象。

#### Scenario: 使用 Skill 创建 Agent

- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', skills: [weatherSkill] })`
- **THEN** 系统自动将 weatherSkill 的 content 注入 system prompt，声明的 tools 和 mcpServers 自动挂载

#### Scenario: Skill 与手动配置共存

- **WHEN** 使用者调用 `createAgent({ model: 'gpt-4', skills: [skillA], tools: [myTool], prompt: '额外指令' })`
- **THEN** 系统合并 Skill 声明的工具和手动传入的工具，prompt 为 Skill content + 用户 prompt

### Requirement: 工具声明解析

系统 SHALL 提供内置工具注册表，将工具名字符串映射到工具实例。Skill 声明的 `requiredTools` SHALL 按以下优先级查找：1) 内置注册表 2) 用户 toolPool。找不到的工具 SHALL 打印 warning 并跳过。

#### Scenario: 内置工具按名查找

- **WHEN** Skill 声明 `tools: ["calculator"]` 且用户未传 toolPool
- **THEN** 系统从内置注册表找到 calculatorTool 并挂载到 Agent

#### Scenario: 自定义工具从 toolPool 查找

- **WHEN** Skill 声明 `tools: ["myTool"]` 且用户传入 `toolPool: [myToolInstance]`
- **THEN** 系统从 toolPool 按 name 匹配找到 myToolInstance 并挂载

#### Scenario: 工具名未找到

- **WHEN** Skill 声明 `tools: ["nonexistent"]` 且注册表和 toolPool 中均无该工具
- **THEN** 系统打印 warning "[Skill] 工具 'nonexistent' 未找到，已跳过"，不阻塞 Agent 启动

### Requirement: MCP 声明合并

Skill 声明的 `requiredMcpServers` SHALL 合并到 Agent 的 mcpServers 配置中。同名 MCP 服务器 SHALL 保留第一个并打印 warning。MCP 连接失败 SHALL 复用现有优雅降级机制。

#### Scenario: Skill 声明 MCP 服务器

- **WHEN** Skill 声明 `mcpServers: { weather: { command: 'uvx', args: ['weather-forecast-server'] } }`
- **THEN** 系统将 weather MCP 配置合并到 Agent 的 mcpServers，尝试连接并获取远程工具

#### Scenario: 多个 Skill 声明同名 MCP

- **WHEN** skillA 和 skillB 都声明了 `mcpServers: { weather: {...} }`
- **THEN** 系统保留 skillA 的 weather 配置，打印 warning 提示名称冲突

### Requirement: 多 Skill 合并

系统 SHALL 按 skills 数组顺序合并多个 Skill 的 tools、mcpServers 和 content。content SHALL 用 `\n\n---\n\n` 分隔符拼接。用户 prompt SHALL 追加在所有 Skill content 之后。

#### Scenario: 两个 Skill 合并

- **WHEN** 使用者传入 `skills: [skillA, skillB]`，skillA content 为 "你是天气专家"，skillB content 为 "你是数据分析师"
- **THEN** 系统生成的 system prompt 为 "你是天气专家\n\n---\n\n你是数据分析师\n\n---\n\n" + 用户 prompt

#### Scenario: 工具去重

- **WHEN** skillA 和 skillB 都声明了 `tools: ["calculator"]`
- **THEN** 系统只挂载一个 calculatorTool，打印 warning 提示名称冲突
