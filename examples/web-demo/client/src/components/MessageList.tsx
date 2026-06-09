import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { ToolCallIndicator } from './ToolCallIndicator';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="welcome">
          <h2>AI Agent Demo</h2>
          <p>基于 ai-agent-sdk 构建的智能助手</p>
          <p className="hint">试试问我：「计算 (123 + 456) * 7」或「现在几点了？」</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map(msg => (
        <div key={msg.id} className="message-wrapper">
          <MessageBubble message={msg} />
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <ToolCallIndicator toolCalls={msg.toolCalls} />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
