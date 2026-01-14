import { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import ErrlAvatar from './ErrlAvatar';
import './ChatInterface.css';

export default function ChatInterface() {
  const {
    messages,
    isLoading,
    error,
    isConnected,
    availableModels,
    selectedModel,
    setSelectedModel,
    sendMessage,
    clearChat,
    checkConnection,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        checkConnection();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isConnected, checkConnection]);

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-title">
            <ErrlAvatar size={32} />
            <h1 className="errl-text-gradient">Chat with Errl</h1>
          </div>
          <div className="chat-controls">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-selector"
              disabled={isLoading}
            >
              {availableModels.length > 0 ? (
                availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))
              ) : (
                <option value={selectedModel}>{selectedModel}</option>
              )}
            </select>
            <button onClick={clearChat} className="clear-button" disabled={isLoading || messages.length === 0}>
              Clear
            </button>
          </div>
        </div>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`} />
          <span className="status-text">
            {isConnected ? 'Connected to Ollama' : 'Not connected to Ollama'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={checkConnection} className="retry-button">
            Retry Connection
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="welcome-message">
            <ErrlAvatar size={80} />
            <h2 className="errl-text-gradient">Hey there!</h2>
            <p>I'm Errl, a slime creature born inside a glowstick at a music festival.</p>
            <p>I'm here to chat, wonder, and bring a little psychedelic softness to your day!</p>
            <p className="welcome-hint">Ask me anything, or just say hi!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isStreaming={isLoading && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <InputBar onSend={sendMessage} isLoading={isLoading} disabled={!isConnected} />
    </div>
  );
}
