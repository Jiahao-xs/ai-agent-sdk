import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { StructuredToolInterface } from '@langchain/core/tools';
import type { ZodSchema } from 'zod';
import type { MCPServerConfig } from '../mcp';

// ─── LLM 相关类型 ───

/** LLM 提供商 */
export type LLMProvider = 'openai';

/** LLM 配置对象 */
export interface LLMConfig {
  provider: LLMProvider;
  name: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  basePath?: string;
  streaming?: boolean;
}

/** 模型输入：字符串 | 配置对象 | LangChain 实例 */
export type ModelInput = string | LLMConfig | BaseChatModel;

// ─── Agent 相关类型 ───

/** Agent 配置 */
export interface AgentConfig {
  model: ModelInput;
  tools?: StructuredToolInterface[];
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  maxIterations?: number;
  streaming?: boolean;
  verbose?: boolean;
  /** MCP 服务器配置（可选） */
  mcpServers?: Record<string, MCPServerConfig>;
}

/** Agent 执行结果 */
export interface AgentResult {
  output: string;
  duration: number;
}

/** Agent 实例接口 */
export interface Agent {
  run(input: string): Promise<AgentResult>;
  stream(input: string, onChunk: (chunk: string) => void): Promise<AgentResult>;
  /** 清理 MCP 连接资源（未配置 MCP 时为 no-op） */
  close(): Promise<void>;
}

// ─── 工具相关类型 ───

/** defineTool 配置 */
export interface DefineToolConfig<
  TSchema extends Record<string, unknown> = Record<string, unknown>,
> {
  name: string;
  description: string;
  parameters: ZodSchema<TSchema>;
  execute: (params: TSchema) => Promise<string> | string;
}

// ─── 图相关类型 ───

/** 图状态 */
export type GraphState = Record<string, unknown>;

/** 图节点处理函数 */
export type NodeHandler<S extends GraphState = GraphState> = (
  state: S,
) => Promise<Partial<S>> | Partial<S>;

/** 条件路由函数 */
export type ConditionFn<S extends GraphState = GraphState> = (state: S) => string;
