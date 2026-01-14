/**
 * AI Service
 * Handles AI-powered features: image-to-vector, prompt-to-vibe, auto-layout
 */

import { getApiKey, hasApiKey, getSelectedModel, type AIModel } from '../utils/apiKeys';
import { traceImageWithGemini, createSVGPlaceholder } from '../utils/imageTracer';
import type { VibeConfig } from '../state/types';

export interface TraceImageOptions {
  quality?: 'high' | 'medium' | 'low';
  prompt?: string;
  onProgress?: (progress: number) => void;
}

export interface AIService {
  traceImage: (imageFile: File, options?: TraceImageOptions) => Promise<string>; // Returns SVG string
  promptToVibe: (prompt: string) => Promise<VibeConfig>; // Returns VibeConfig
  autoLayout: (objects: any[]) => Promise<any[]>; // Returns optimized layout
  hasImageTracing: () => boolean; // Check if image tracing is available
}

class AIServiceImpl implements AIService {
  hasImageTracing(): boolean {
    // Check if any AI provider has an API key available
    return hasApiKey('gemini') || hasApiKey('openai') || hasApiKey('anthropic');
  }

  async traceImage(imageFile: File, options?: TraceImageOptions): Promise<string> {
    const { onProgress } = options || {};
    
    // Get selected model
    const selectedModel = getSelectedModel();
    // Import AI_MODELS dynamically to avoid circular dependency issues  
    const { AI_MODELS } = await import('../utils/apiKeys');
    const modelInfo = AI_MODELS[selectedModel];
    const apiKey = getApiKey(modelInfo.provider);
    
    if (apiKey) {
      try {
        onProgress?.(0.3);
        const modelParam = selectedModel.startsWith('gemini-') ? selectedModel : undefined;
        const svg = await traceImageWithGemini(imageFile, apiKey, {
          ...(options || {}),
          model: modelParam,
        });
        onProgress?.(1.0);
        return svg;
      } catch (error) {
        console.warn('AI tracing failed, falling back to placeholder:', error);
        // Fall through to placeholder
      }
    }
    
    // Fallback: Create SVG with embedded image
    onProgress?.(0.5);
    const placeholder = await createSVGPlaceholder(imageFile);
    onProgress?.(1.0);
    return placeholder;
  }

  async promptToVibe(prompt: string): Promise<VibeConfig> {
    // Enhanced keyword-based implementation
    // TODO: In production, this could use Gemini to parse more complex prompts
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for multiple vibe combinations
    const vibes: VibeConfig[] = [];
    
    if (lowerPrompt.includes('pulse') || lowerPrompt.includes('beat') || lowerPrompt.includes('throb')) {
      const intensity = lowerPrompt.includes('strong') || lowerPrompt.includes('intense') ? 0.9 : 
                       lowerPrompt.includes('gentle') || lowerPrompt.includes('soft') ? 0.4 : 0.7;
      const speed = lowerPrompt.includes('fast') || lowerPrompt.includes('quick') ? 1.5 :
                    lowerPrompt.includes('slow') ? 0.6 : 1.2;
      vibes.push({ type: 'pulse', intensity, speed });
    }
    
    if (lowerPrompt.includes('glow') || lowerPrompt.includes('shine') || lowerPrompt.includes('neon')) {
      // Extract color if mentioned
      let color = '#00FF9D'; // default emerald
      if (lowerPrompt.includes('green')) color = '#00FF9D';
      else if (lowerPrompt.includes('blue')) color = '#00B8FF';
      else if (lowerPrompt.includes('red')) color = '#FF0066';
      else if (lowerPrompt.includes('purple')) color = '#7000FF';
      else if (lowerPrompt.includes('pink')) color = '#FF007A';
      
      const radius = lowerPrompt.includes('large') || lowerPrompt.includes('big') ? 20 :
                     lowerPrompt.includes('small') ? 8 : 15;
      vibes.push({ type: 'glow', color, radius });
    }
    
    if (lowerPrompt.includes('float') || lowerPrompt.includes('drift') || lowerPrompt.includes('bob')) {
      const amplitude = lowerPrompt.includes('high') ? 20 : lowerPrompt.includes('low') ? 6 : 12;
      const frequency = lowerPrompt.includes('fast') ? 1.2 : lowerPrompt.includes('slow') ? 0.5 : 0.8;
      vibes.push({ type: 'float', amplitude, frequency });
    }
    
    if (lowerPrompt.includes('shake') || lowerPrompt.includes('vibrate') || lowerPrompt.includes('jitter')) {
      const intensity = lowerPrompt.includes('strong') ? 12 : lowerPrompt.includes('gentle') ? 4 : 8;
      const speed = lowerPrompt.includes('fast') ? 2.0 : lowerPrompt.includes('slow') ? 0.8 : 1.5;
      vibes.push({ type: 'shake', intensity, speed });
    }
    
    if (lowerPrompt.includes('rotate') || lowerPrompt.includes('spin') || lowerPrompt.includes('twirl')) {
      const speed = lowerPrompt.includes('fast') ? 2.0 : lowerPrompt.includes('slow') ? 0.5 : 1.0;
      vibes.push({ type: 'rotation', speed });
    }
    
    if (lowerPrompt.includes('flicker') || lowerPrompt.includes('flash')) {
      vibes.push({ type: 'opacity_flicker', intensity: 0.8, speed: 1.5 });
    }

    // Return first vibe or default pulse
    return vibes[0] || { type: 'pulse', intensity: 0.5, speed: 1.0 };
  }

  async autoLayout(objects: any[]): Promise<any[]> {
    // Placeholder implementation
    // In production, this would use AI to optimize object positions
    // For now, return a simple grid layout
    const cols = Math.ceil(Math.sqrt(objects.length));
    const spacing = 100;
    
    return objects.map((obj, index) => ({
      ...obj,
      x: (index % cols) * spacing,
      y: Math.floor(index / cols) * spacing,
    }));
  }
}

// Singleton instance
let aiInstance: AIService | null = null;

export const getAIService = (): AIService => {
  if (!aiInstance) {
    aiInstance = new AIServiceImpl();
  }
  return aiInstance;
};

