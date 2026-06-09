import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ToolCallInfo } from '../types';

let messageId = 0;
function genId(): string {
  return `msg-${Date.now()}-${++messageId}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return;

      const userMsg: ChatMessage = { id: genId(), role: 'user', content };
      const assistantMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: '',
        toolCalls: [],
      };

      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取响应流');

        const decoder = new TextDecoder();
        let buffer = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let currentEvent = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ') && currentEvent) {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(currentEvent, data, assistantMsg.id);
              currentEvent = '';
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;

        const errMsg: ChatMessage = {
          id: genId(),
          role: 'error',
          content: error instanceof Error ? error.message : '连接失败，请重试',
        };
        setMessages(prev => [...prev, errMsg]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [loading],
  );

  const handleSSEEvent = (
    event: string,
    data: Record<string, unknown>,
    msgId: string,
  ): void => {
    switch (event) {
      case 'token':
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId ? { ...m, content: m.content + (data.content as string) } : m,
          ),
        );
        break;

      case 'tool_start': {
        const toolCall: ToolCallInfo = {
          tool: data.tool as string,
          args: data.args as Record<string, unknown>,
          status: 'running',
        };
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] } : m,
          ),
        );
        break;
      }

      case 'tool_end':
        setMessages(prev =>
          prev.map(m => {
            if (m.id !== msgId) return m;
            const updated = (m.toolCalls || []).map(tc =>
              tc.tool === data.tool && tc.status === 'running'
                ? { ...tc, result: data.result as string, status: 'done' as const }
                : tc,
            );
            return { ...m, toolCalls: updated };
          }),
        );
        break;

      case 'done':
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId ? { ...m, duration: data.duration as number } : m,
          ),
        );
        break;

      case 'error':
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId
              ? { ...m, content: m.content || `错误: ${data.message as string}` }
              : m,
          ),
        );
        break;
    }
  };

  return { messages, loading, sendMessage };
}
