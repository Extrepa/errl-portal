import ReactMarkdown from 'react-markdown';
import ErrlAvatar from './ErrlAvatar';
import { Message } from '../services/ollama';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'} errl-fade-in`}>
      {isAssistant && (
        <div className="message-avatar">
          <ErrlAvatar isThinking={isStreaming} size={40} />
        </div>
      )}
      <div className={`message-content ${isUser ? 'message-content-user' : 'message-content-assistant'}`}>
        {isAssistant ? (
          <div className="message-text-assistant">
            <ReactMarkdown>{message.content || (isStreaming ? '...' : '')}</ReactMarkdown>
            {isStreaming && <span className="streaming-cursor">▋</span>}
          </div>
        ) : (
          <div className="message-text-user">
            {message.content}
          </div>
        )}
      </div>
      {isUser && (
        <div className="message-avatar message-avatar-user">
          <div className="user-avatar">You</div>
        </div>
      )}
    </div>
  );
}
