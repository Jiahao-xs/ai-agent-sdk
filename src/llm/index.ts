import { ChatOpenAI } from '@langchain/openai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { LLMConfig, ModelInput } from '../core/types';

/**
 * 将 ModelInput 统一解析为 BaseChatModel 实例
 */
export function resolveModel(input: ModelInput): BaseChatModel {
  // 模式 1: 字符串 → 默认 OpenAI
  if (typeof input === 'string') {
    return new ChatOpenAI({ modelName: input });
  }

  // 模式 2: LangChain 实例 → 直接透传
  if (isBaseChatModel(input)) {
    return input;
  }

  // 模式 3: 配置对象 → 根据 provider 创建
  return createFromConfig(input);
}

/** 判断是否为 LangChain ChatModel 实例 */
function isBaseChatModel(input: unknown): input is BaseChatModel {
  return (
    typeof input === 'object' &&
    input !== null &&
    'invoke' in input &&
    'bindTools' in input
  );
}

/** 从配置对象创建 ChatModel */
function createFromConfig(config: LLMConfig): BaseChatModel {
  switch (config.provider) {
    case 'openai':
      return new ChatOpenAI({
        modelName: config.name,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        apiKey: config.apiKey,
        configuration: config.basePath ? { baseURL: config.basePath } : undefined,
        streaming: config.streaming,
      });
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
