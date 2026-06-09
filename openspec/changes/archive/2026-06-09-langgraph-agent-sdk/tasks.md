## 1. 项目基础设施

- [x] 1.1 创建 package.json，声明项目名称 ai-agent-sdk、运行时依赖（@langchain/langgraph, @langchain/core, @langchain/openai, zod, dotenv）和开发依赖（typescript, eslint, prettier, @typescript-eslint/*, eslint-config-prettier, eslint-plugin-prettier, tsup, vitest, ts-node）
- [x] 1.2 创建 tsconfig.json，启用 strict 模式、路径别名 @/* 映射 src/*、声明文件输出
- [x] 1.3 创建 .eslintrc.js，配置 @typescript-eslint 解析器 + prettier 集成
- [x] 1.4 创建 .prettierrc，配置代码风格（semi, singleQuote, trailingComma, printWidth 等）
- [x] 1.5 创建 .gitignore（node_modules, dist, .env, *.log）和 .env.example
- [x] 1.6 创建 tsup.config.ts，配置 ESM + CJS 双格式输出
- [x] 1.7 运行 pnpm install 安装所有依赖

## 2. 目录结构

- [x] 2.1 创建 src/core/index.ts — 核心类型定义和公共接口
- [x] 2.2 创建 src/llm/index.ts — LLM 适配层入口
- [x] 2.3 创建 src/tools/index.ts — 工具系统入口
- [x] 2.4 创建 src/agents/index.ts — Agent 构建器入口
- [x] 2.5 创建 src/index.ts — 统一导出入口

## 3. LLM 适配层 (llm-adapter)

- [x] 3.1 在 src/llm/ 中定义 LLM 类型接口：LLMConfig、LLMProvider 枚举、ModelInput 联合类型（string | LLMConfig | BaseChatModel）
- [x] 3.2 实现 resolveModel() 函数，支持字符串模式（自动创建 ChatOpenAI）
- [x] 3.3 实现 resolveModel() 函数，支持配置对象模式（根据 provider 创建对应 ChatModel）
- [x] 3.4 实现 resolveModel() 函数，支持 LangChain 实例透传模式
- [x] 3.5 添加 TypeScript 函数重载，确保三种传参模式的类型推导正确

## 4. 工具系统 (tool-system)

- [x] 4.1 实现 defineTool() 函数式工具定义，接受 name/description/parameters(zod)/execute，返回 StructuredTool 实例
- [x] 4.2 实现 BaseTool 抽象类，提供 name/description/schema 属性和抽象 execute 方法，子类继承后转为 StructuredTool
- [x] 4.3 实现 ToolRegistry 类，支持 register/get/getAll 方法
- [x] 4.4 实现内置 calculator 工具（数学表达式计算）
- [x] 4.5 实现内置 date_time 工具（获取当前日期时间）

## 5. Agent 声明式 API (agent-factory)

- [x] 5.1 定义 AgentConfig 接口（model/tools/prompt/temperature/maxTokens/maxIterations/streaming/verbose）
- [x] 5.2 定义 AgentResult 接口（output/duration/intermediateSteps）
- [x] 5.3 实现 createAgent() 工厂函数，内部调用 LangGraph createReactAgent
- [x] 5.4 实现 Agent 实例的 run(input) 方法，执行 ReAct 循环并返回 AgentResult
- [x] 5.5 实现 Agent 实例的 stream(input, onChunk) 方法，支持流式输出
- [x] 5.6 实现默认配置合并逻辑（temperature 0.7, maxIterations 10 等）

## 6. Agent 图构建器 API (agent-graph)

- [x] 6.1 实现 AgentGraph 类，提供 addNode(name, handler) 链式方法
- [x] 6.2 实现 addEdge(from, to) 固定边方法
- [x] 6.3 实现 addConditionalEdge(from, conditionFn) 条件边方法
- [x] 6.4 实现 compile() 方法，将图定义编译为 LangGraph CompiledGraph
- [x] 6.5 添加图结构校验（孤立节点检测、入口检查），编译时抛出明确错误

## 7. 使用示例

- [x] 7.1 创建 examples/basic-agent.ts — 声明式 createAgent 使用示例（含工具调用和流式输出）
- [x] 7.2 创建 examples/custom-graph.ts — AgentGraph 图构建器使用示例（自定义多节点工作流）

## 8. 验证与收尾

- [x] 8.1 运行 pnpm run build 确认 TypeScript 编译通过
- [x] 8.2 运行 pnpm run lint 确认 ESLint 检查通过
- [x] 8.3 运行 pnpm run format 确认 Prettier 格式化通过
- [x] 8.4 验证所有公共 API 从 src/index.ts 正确导出
