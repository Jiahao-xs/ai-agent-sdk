/** SSE 事件类型枚举 */
export type SSEEventType = 'token' | 'tool_start' | 'tool_end' | 'done' | 'error';

/** SSE 事件基础结构 */
export interface SSEEvent<T extends SSEEventType = SSEEventType, D = unknown> {
  type: T;
  data: D;
}

/** token 事件 — LLM 生成的文本片段 */
export interface TokenEvent extends SSEEvent<'token', { content: string }> {
  type: 'token';
}

/** tool_start 事件 — 工具开始调用 */
export interface ToolStartEvent extends SSEEvent<
  'tool_start',
  { tool: string; args: Record<string, unknown> }
> {
  type: 'tool_start';
}

/** tool_end 事件 — 工具调用完成 */
export interface ToolEndEvent extends SSEEvent<
  'tool_end',
  { tool: string; result: string }
> {
  type: 'tool_end';
}

/** done 事件 — 本轮对话完成 */
export interface DoneEvent extends SSEEvent<
  'done',
  { output: string; duration: number }
> {
  type: 'done';
}

/** error 事件 — 发生错误 */
export interface ErrorEvent extends SSEEvent<'error', { message: string }> {
  type: 'error';
}

/** 所有 SSE 事件联合类型 */
export type AnySSEEvent =
  | TokenEvent
  | ToolStartEvent
  | ToolEndEvent
  | DoneEvent
  | ErrorEvent;

/** 聊天请求 body */
export interface ChatRequest {
  message: string;
}
