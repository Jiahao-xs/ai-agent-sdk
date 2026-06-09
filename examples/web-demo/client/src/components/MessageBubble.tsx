import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content } = message;

  if (role === 'error') {
    return (
      <div className="message-bubble error">
        <div className="bubble-content">
          <span className="error-icon">!</span>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`message-bubble ${role}`}>
      <div className="bubble-header">
        <span className="role-label">{role === 'user' ? '你' : 'AI 助手'}</span>
        {message.duration !== undefined && (
          <span className="duration">{(message.duration / 1000).toFixed(1)}s</span>
        )}
      </div>
      <div className="bubble-content">
        {content || <span className="typing-indicator">正在输入...</span>}
      </div>
    </div>
  );
}
