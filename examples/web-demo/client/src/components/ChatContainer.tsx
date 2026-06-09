import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '../types';

interface ChatContainerProps {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
}

export function ChatContainer({ messages, loading, onSend }: ChatContainerProps) {
  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>AI Agent Demo</h1>
        <span className="badge">ai-agent-sdk</span>
      </header>
      <MessageList messages={messages} />
      <ChatInput onSend={onSend} disabled={loading} />
    </div>
  );
}
