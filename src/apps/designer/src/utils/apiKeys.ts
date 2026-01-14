/**
 * Utility functions for managing API keys
 * Checks localStorage first, then falls back to environment variables
 */

const STORAGE_KEYS = {
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY'
};

/**
 * Get API key from localStorage or environment variable
 */
export function getApiKey(provider: 'gemini' | 'openai' | 'anthropic'): string | undefined {
  // Check localStorage first (user input)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS[provider]);
    if (stored) {
      return stored;
    }
  }
  
  // Fall back to environment variable (via Vite import.meta.env)
  // Note: import.meta.env is available in Vite, but TypeScript may not recognize it
  // We'll use a try-catch to safely access it
  try {
    const env = (import.meta as any).env || {};
    const envKey = provider === 'gemini' 
      ? (env.VITE_GEMINI_API_KEY || env.VITE_API_KEY)
      : env[`VITE_${provider.toUpperCase()}_API_KEY`];
    
    if (envKey) return envKey;
  } catch {
    // Environment variables not available
  }
  
  return undefined;
}

/**
 * Check if an API key is configured for a provider
 */
export function hasApiKey(provider: 'gemini' | 'openai' | 'anthropic'): boolean {
  return !!getApiKey(provider);
}

/**
 * Store API key in localStorage
 */
export function setApiKey(provider: 'gemini' | 'openai' | 'anthropic', key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS[provider], key);
  }
}

/**
 * AI Model types
 */
export type AIModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash-exp' | 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet';

export const AI_MODELS = {
  'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', provider: 'gemini' as const },
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', provider: 'gemini' as const },
  'gemini-2.0-flash-exp': { name: 'Gemini 2.0 Flash Exp', provider: 'gemini' as const },
  'gpt-4o': { name: 'GPT-4o', provider: 'openai' as const },
  'gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'openai' as const },
  'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', provider: 'anthropic' as const },
};

/**
 * Get selected AI model from localStorage
 */
export function getSelectedModel(): AIModel {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('AI_MODEL');
    if (stored && stored in AI_MODELS) {
      return stored as AIModel;
    }
  }
  return 'gemini-1.5-flash'; // Default
}

/**
 * Store selected AI model in localStorage
 */
export function setSelectedModel(model: AIModel): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('AI_MODEL', model);
  }
}

