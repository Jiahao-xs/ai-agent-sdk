# ai-agent-sdk

基于 LangGraph 的通用 AI 智能体 SDK，提供声明式和图构建器双层 API。

## 特性

- **双层 API**：声明式 `createAgent()`（ReAct 模式）+ 图构建器 `AgentGraph`（自定义工作流）
- **灵活模型配置**：支持字符串、配置对象、LangChain 实例三种传参方式
- **双模式工具系统**：`defineTool` 函数式 + `BaseTool` 类式，内置计算器/日期时间工具
- **MCP 集成**：声明式接入 MCP 工具服务器，自动获取远程工具
- **Skill 插件系统**：声明式 Markdown Skill 文件，自动注入 prompt、解析工具和 MCP 服务器
- **流式输出**：`stream()` 方法支持逐 token 回调
- **TypeScript 优先**：完整类型定义

## 安装

```bash
npm install ai-agent-sdk
# 或
pnpm add ai-agent-sdk
```

## 环境变量

SDK 使用 OpenAI 兼容接口，需要配置以下环境变量：

```bash
OPENAI_API_KEY=sk-xxx              # API 密钥
OPENAI_API_BASE=https://api.openai.com/v1  # API 地址（可选，支持兼容接口）
OPENAI_MODEL=gpt-4o-mini           # 默认模型（可选）
```

## 快速开始

### 声明式 Agent（推荐）

```typescript
import { createAgent, calculatorTool, dateTimeTool } from 'ai-agent-sdk';

// 创建 Agent
const agent = await createAgent({
  model: 'gpt-4o-mini',
  tools: [calculatorTool, dateTimeTool],
  prompt: '你是一个智能助手，请使用中文回答用户的问题。',
});

// 执行对话
const result = await agent.run('计算 (123 + 456) * 7');
console.log(result.output); // 回答内容
console.log(result.duration); // 耗时(ms)
```

### 流式输出

```typescript
const result = await agent.stream('写一首关于春天的诗', chunk => {
  process.stdout.write(chunk); // 逐 token 输出
});
```

### 模型配置

支持三种传参方式：

```typescript
// 方式 1：字符串（使用默认 OpenAI 配置）
const agent = await createAgent({ model: 'gpt-4o-mini' });

// 方式 2：配置对象（推荐，可指定 apiKey/basePath）
const agent = await createAgent({
  model: {
    provider: 'openai',
    name: 'gpt-4o-mini',
    apiKey: 'sk-xxx',
    basePath: 'https://api.openai.com/v1',
    temperature: 0.7,
    maxTokens: 2000,
  },
});

// 方式 3：LangChain 实例（完全控制）
import { ChatOpenAI } from '@langchain/openai';

const agent = await createAgent({
  model: new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
  }),
});
```

## 工具系统

### 函数式定义工具（`defineTool`）

```typescript
import { defineTool } from 'ai-agent-sdk';
import { z } from 'zod';

const weatherTool = defineTool({
  name: 'get_weather',
  description: '获取指定城市的天气信息',
  parameters: z.object({
    city: z.string().describe('城市名称'),
    unit: z.enum(['celsius', 'fahrenheit']).optional().describe('温度单位'),
  }),
  execute: async ({ city, unit = 'celsius' }) => {
    // 调用天气 API
    return `${city} 当前温度: 25°${unit === 'celsius' ? 'C' : 'F'}`;
  },
});
```

### 类式定义工具（`BaseTool`）

适合有状态或复杂逻辑的工具：

```typescript
import { BaseTool } from 'ai-agent-sdk';
import { z } from 'zod';

class DatabaseTool extends BaseTool {
  name = 'query_database';
  description = '执行数据库查询';
  parameters = z.object({
    sql: z.string().describe('SQL 查询语句'),
  });

  async execute({ sql }: { sql: string }) {
    // 执行数据库查询
    return `查询结果: ...`;
  }
}

const dbTool = new DatabaseTool();
const agent = await createAgent({
  model: 'gpt-4o-mini',
  tools: [dbTool.toStructuredTool()],
});
```

### 工具注册表（`ToolRegistry`）

集中管理多个工具：

```typescript
import { ToolRegistry, calculatorTool, dateTimeTool } from 'ai-agent-sdk';

const registry = new ToolRegistry();
registry.register(calculatorTool);
registry.register(dateTimeTool);

const agent = await createAgent({
  model: 'gpt-4o-mini',
  tools: registry.getAll(),
});
```

### 内置工具

| 工具             | 说明                               |
| ---------------- | ---------------------------------- |
| `calculatorTool` | 数学计算器，支持加减乘除和括号运算 |
| `dateTimeTool`   | 获取当前日期时间，支持时区配置     |

## MCP 集成

通过 MCP (Model Context Protocol) 接入外部工具服务器：

### 声明式配置

```typescript
const agent = await createAgent({
  model: 'gpt-4o-mini',
  mcpServers: {
    filesystem: {
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    },
    database: {
      transport: 'http',
      url: 'http://localhost:5000/mcp',
      headers: { Authorization: 'Bearer xxx' },
    },
  },
});

// Agent 自动获得 MCP 远程工具
const result = await agent.run('读取 /tmp/config.json');

// 使用完毕后关闭连接
await agent.close();
```

### 支持的传输方式

| 传输    | 配置字段          | 适用场景        |
| ------- | ----------------- | --------------- |
| `stdio` | `command`, `args` | 本地 MCP 子进程 |
| `http`  | `url`, `headers`  | 远程 HTTP 服务  |
| `sse`   | `url`             | SSE 流式通信    |

### 独立 MCP Client

```typescript
import { createMCPClient } from 'ai-agent-sdk';

const { tools, close } = await createMCPClient({
  filesystem: {
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
  },
});

// tools 可传给 AgentGraph 或 createAgent
const agent = await createAgent({ model: 'gpt-4o-mini', tools });

await close();
```

### 工具冲突处理

当远程工具与本地工具同名时，**本地工具优先**，远程工具被忽略并打印 warning。

## Skill 插件系统

通过 Markdown 文件声明式定义 Skill，SDK 自动处理 prompt 注入、工具解析和 MCP 服务器配置。

### SKILL.md 格式

```markdown
---
name: weather-analyst
description: 天气数据分析与播报专家
version: '1.0.0'
tools:
  - calculator
mcpServers:
  weather:
    command: uvx
    args: [weather-forecast-server]
---

你是一个专业的天气数据分析师。

## 能力

- 解读气象数据，给出穿衣建议
- 对比多城市天气，推荐出行方案
```

### 加载与使用

```typescript
import { createAgent, loadSkill, loadSkills } from 'ai-agent-sdk';

// 方式 1：从单个文件加载
const skill = await loadSkill('./skills/weather-analyst/SKILL.md');

// 方式 2：从目录批量加载
const skills = await loadSkills('./skills');

// 方式 3：内联 Skill 对象（无需文件）
const inlineSkill = {
  name: 'translator',
  description: '专业翻译助手',
  content: '你是一个专业翻译，请将用户输入翻译为英文。',
};

// 在 createAgent 中使用（自动注入 prompt + 解析工具 + 合并 MCP）
const agent = await createAgent({
  model: 'gpt-4o-mini',
  skills,
  prompt: '请用简洁的中文回答。',
});
```

### Skill API

| 方法                          | 说明                                      |
| ----------------------------- | ----------------------------------------- |
| `loadSkill(filePath)`         | 从单个 SKILL.md 文件加载                  |
| `loadSkills(dirPath)`         | 从目录递归批量加载所有 Skill              |
| `parseSkillFile(content)`     | 解析 SKILL.md 字符串为 Skill 对象         |
| `mergeSkills(skills, config)` | 合并多个 Skill 的 prompt、工具和 MCP 配置 |

## 图构建器（`AgentGraph`）

用于构建自定义工作流，支持条件路由：

```typescript
import { AgentGraph } from 'ai-agent-sdk';

interface MyState {
  input: string;
  classification: string;
  result: string;
}

const graph = new AgentGraph<MyState>()
  .addNode('classify', async state => {
    const isMath = /[\d+\-*/()]/.test(state.input);
    return { classification: isMath ? 'math' : 'text' };
  })
  .addNode('math_handler', async state => {
    return { result: `数学计算: ${state.input}` };
  })
  .addNode('text_handler', async state => {
    return { result: `文本处理: ${state.input}` };
  })
  .addConditionalEdge('classify', state => {
    return state.classification === 'math' ? 'math_handler' : 'text_handler';
  });

const compiled = graph.compile();
const result = await compiled.invoke({
  input: '1 + 2 * 3',
  classification: '',
  result: '',
});
```

### AgentGraph API

| 方法                                            | 说明                                 |
| ----------------------------------------------- | ------------------------------------ |
| `addNode(name, handler)`                        | 添加节点，第一个节点自动成为入口     |
| `addEdge(from, to)`                             | 添加固定边，`to` 为 `'end'` 表示结束 |
| `addConditionalEdge(from, condition, pathMap?)` | 添加条件边                           |
| `setEntryPoint(name)`                           | 设置入口点（覆盖自动选择）           |
| `compile()`                                     | 编译图为可执行对象                   |

## AgentConfig 完整参考

```typescript
interface AgentConfig {
  /** 模型配置（必填） */
  model: string | LLMConfig | BaseChatModel;
  /** 工具列表 */
  tools?: StructuredToolInterface[];
  /** 系统提示词 */
  prompt?: string;
  /** 温度参数（0-1） */
  temperature?: number;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 最大迭代次数（默认 10） */
  maxIterations?: number;
  /** 是否启用流式 */
  streaming?: boolean;
  /** 是否输出详细日志 */
  verbose?: boolean;
  /** MCP 服务器配置 */
  mcpServers?: Record<string, MCPServerConfig>;
  /** Skill 插件数组 */
  skills?: Skill[];
}
```

## 项目结构

```
src/
├── core/          # 核心类型定义
│   └── types.ts   # AgentConfig, Agent, LLMConfig 等
├── llm/           # LLM 适配层
│   └── index.ts   # resolveModel()
├── tools/         # 工具系统
│   ├── index.ts   # defineTool, BaseTool, ToolRegistry
│   └── builtins/  # 内置工具
├── agents/        # Agent 实现
│   ├── create-agent.ts  # createAgent()
│   └── agent-graph.ts   # AgentGraph
├── mcp/           # MCP 集成
│   └── index.ts   # MCPClientManager, createMCPClient
├── skills/        # Skill 插件系统
│   ├── loader.ts  # loadSkill(), loadSkills(), parseSkillFile()
│   ├── registry.ts # 工具注册表
│   ├── merge.ts   # mergeSkills()
│   └── types.ts   # Skill, SkillFrontmatter
└── index.ts       # 统一导出
```

## 开发

```bash
pnpm install          # 安装依赖
pnpm run build        # 构建
pnpm run lint         # ESLint 检查
pnpm run format       # Prettier 格式化
pnpm run typecheck    # TypeScript 类型检查
pnpm run test         # 单元测试
```

项目使用 **Husky + lint-staged**，`git commit` 时自动对暂存文件执行 ESLint 修复和 Prettier 格式化。

## 示例

- [basic-agent.ts](examples/basic-agent.ts) — 基础 Agent 使用
- [custom-graph.ts](examples/custom-graph.ts) — 图构建器自定义工作流
- [skill-demo.ts](examples/skill-demo.ts) — Skill 插件系统使用
- [web-demo](examples/web-demo/) — React + Express + SSE 完整 Web 应用

## 许可证

MIT
