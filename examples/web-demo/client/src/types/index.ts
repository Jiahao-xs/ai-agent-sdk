export type SSEEventType = 'token' | 'tool_start' | 'tool_end' | 'done' | 'error';

export interface TokenData {
  content: string;
}

export interface ToolStartData {
  tool: string;
  args: Record<string, unknown>;
}

export interface ToolEndData {
  tool: string;
  result: string;
}

export interface DoneData {
  output: string;
  duration: number;
}

export interface ErrorData {
  message: string;
}

/** 消息类型 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  toolCalls?: ToolCallInfo[];
  duration?: number;
}

/** 工具调用信息 */
export interface ToolCallInfo {
  tool: string;
  args?: Record<string, unknown>;
  result?: string;
  status: 'running' | 'done';
}
