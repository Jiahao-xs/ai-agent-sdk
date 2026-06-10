## ADDED Requirements

### Requirement: SKILL.md 文件格式

系统 SHALL 支持 SKILL.md 文件格式，包含 YAML frontmatter 元数据和 Markdown body 指令内容。frontmatter SHALL 包含 `name` 字段（必需），可选包含 `description`、`version`、`tools`（字符串数组）、`mcpServers`（MCP 配置对象）。

#### Scenario: 解析标准 SKILL.md

- **WHEN** 系统读取一个包含 `---` frontmatter 分隔符和 Markdown body 的 SKILL.md 文件
- **THEN** 系统成功解析 frontmatter 为元数据对象，提取 body 为 content 字符串

#### Scenario: frontmatter 解析失败

- **WHEN** SKILL.md 的 frontmatter YAML 语法有误
- **THEN** 系统抛出错误，错误信息包含文件路径和 YAML 解析错误详情

#### Scenario: 缺少 name 字段

- **WHEN** SKILL.md 的 frontmatter 中没有 `name` 字段
- **THEN** 系统使用所在目录名作为默认 name

### Requirement: loadSkill 单文件加载

系统 SHALL 提供 `loadSkill(filePath: string)` 异步函数，读取并解析单个 SKILL.md 文件，返回 `Skill` 对象。

#### Scenario: 加载有效 Skill 文件

- **WHEN** 使用者调用 `loadSkill('./skills/weather/SKILL.md')` 且文件存在且格式正确
- **THEN** 系统返回包含 name、content、requiredTools、requiredMcpServers 的 Skill 对象

#### Scenario: 文件不存在

- **WHEN** 使用者调用 `loadSkill('./nonexistent/SKILL.md')` 且文件不存在
- **THEN** 系统抛出错误，提示文件路径不存在

### Requirement: loadSkills 目录批量加载

系统 SHALL 提供 `loadSkills(dirPath: string)` 异步函数，递归扫描目录中所有 `SKILL.md` 文件并返回 `Skill[]`。

#### Scenario: 加载目录中的多个 Skill

- **WHEN** 使用者调用 `loadSkills('./skills/')` 且目录下有 `weather/SKILL.md` 和 `analyst/SKILL.md`
- **THEN** 系统返回包含 2 个 Skill 对象的数组

#### Scenario: 目录为空

- **WHEN** 使用者调用 `loadSkills('./empty-dir/')` 且目录下无 SKILL.md 文件
- **THEN** 系统返回空数组

#### Scenario: 内联 Skill 对象

- **WHEN** 使用者直接构造 `{ name: 'translator', content: '你是翻译专家...' }` 对象
- **THEN** 该对象可直接用于 createAgent 的 skills 参数，无需经过文件加载
