import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, generateResponse, streamResponse, checkOllamaConnection, getAvailableModels } from '../services/ollama';
import { buildMessageHistory } from '../services/personality';

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  availableModels: string[];
  selectedModel: string;
}

const STORAGE_KEY = 'errl-chat-history';
const STORAGE_MODEL_KEY = 'errl-selected-model';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_MODEL_KEY);
    return saved || 'llama3.2';
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
    loadModels();
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Save selected model to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_MODEL_KEY, selectedModel);
  }, [selectedModel]);

  const checkConnection = useCallback(async () => {
    const connected = await checkOllamaConnection();
    setIsConnected(connected);
    if (!connected) {
      setError('Cannot connect to Ollama. Make sure Ollama is running on localhost:11434');
    } else {
      setError(null);
    }
  }, []);

  const loadModels = useCallback(async () => {
    const models = await getAvailableModels();
    setAvailableModels(models);
    if (models.length > 0 && !models.includes(selectedModel)) {
      setSelectedModel(models[0]);
    }
  }, [selectedModel]);

  const sendMessage = useCallback(async (content: string, useStreaming: boolean = true) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    // Build message history
    const messageHistory = buildMessageHistory(content, messages);

    // Add placeholder for assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      if (useStreaming) {
        // Streaming response
        let fullResponse = '';
        await streamResponse(
          messageHistory,
          selectedModel,
          (chunk: string) => {
            fullResponse += chunk;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                role: 'assistant',
                content: fullResponse,
              };
              return newMessages;
            });
          }
        );
      } else {
        // Non-streaming response
        const response = await generateResponse(messageHistory, selectedModel);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: response,
          };
          return newMessages;
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errorMessage);
      // Remove the placeholder message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, selectedModel, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    if (messages.length < 2) return;
    
    // Remove last two messages (user + assistant)
    const newMessages = messages.slice(0, -2);
    setMessages(newMessages);
    
    // Resend the user message
    const lastUserMessage = messages[messages.length - 2];
    if (lastUserMessage.role === 'user') {
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    availableModels,
    selectedModel,
    setSelectedModel,
    sendMessage,
    clearChat,
    retryLastMessage,
    checkConnection,
    loadModels,
  };
}
