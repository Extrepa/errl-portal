import React, { useState } from 'react';
import { Upload, Sparkles, Settings, AlertCircle } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { getAIService } from '../../services/aiService';
import { generateId } from '../../utils/helpers';
import { getApiKey, setApiKey, hasApiKey, getSelectedModel, AI_MODELS, type AIModel } from '../../utils/apiKeys';
import { traceImageWithGemini } from '../../utils/imageTracer';
import type { VibeConfig } from '../../state/types';

export const AITraceTool: React.FC = () => {
  const { project, addAsset, selection, updateComponent } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKeyValue] = useState(getApiKey('gemini') || '');
  const [error, setError] = useState<string | null>(null);
  const [versusMode, setVersusMode] = useState(false);
  const [versusResults, setVersusResults] = useState<{ model: string; svg: string; time: number }[]>([]);

  const aiService = getAIService();
  const hasTracing = aiService.hasImageTracing();

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      setApiKey('gemini', apiKey.trim());
      setShowApiKeyInput(false);
      setError(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setVersusResults([]);

    try {
      if (versusMode) {
        // Versus mode: compare multiple models
        const modelsToCompare: AIModel[] = ['gemini-1.5-flash', 'gemini-1.5-pro'];
        const results: { model: string; svg: string; time: number }[] = [];

        for (let i = 0; i < modelsToCompare.length; i++) {
          const model = modelsToCompare[i];
          const modelInfo = AI_MODELS[model];
          const modelApiKey = getApiKey(modelInfo.provider);
          
          if (!modelApiKey) {
            console.warn(`No API key for ${model}`);
            continue;
          }

          const startTime = Date.now();
          setProgress((i + 0.3) / modelsToCompare.length);
          
          try {
            const svg = await traceImageWithGemini(file, modelApiKey, {
              model: model.startsWith('gemini-') ? model : undefined,
            });
            const time = Date.now() - startTime;
            
            results.push({ model: modelInfo.name, svg, time });
            
            // Create asset for each result
            const newAsset = {
              id: generateId('asset'),
              name: `${file.name.replace(/\.[^/.]+$/, '')}_${model}`,
              type: 'svg' as const,
              data: svg,
            };
            addAsset(newAsset);
          } catch (err: any) {
            console.error(`Failed to trace with ${model}:`, err);
          }
          
          setProgress((i + 1) / modelsToCompare.length);
        }
        
        setVersusResults(results);
        setProgress(1.0);
      } else {
        // Single model mode
        const svgData = await aiService.traceImage(file, {
          onProgress: (p) => setProgress(p),
        });
        
        const newAsset = {
          id: generateId('asset'),
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'svg' as const,
          data: svgData,
        };

        addAsset(newAsset);
        setProgress(1.0);
      }
      
      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      console.error('AI trace failed:', error);
      setError(error?.message || 'Failed to trace image. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handlePromptToVibe = async () => {
    if (!prompt.trim() || !project) return;

    setIsProcessing(true);
    setError(null);
    try {
      const vibe = await aiService.promptToVibe(prompt) as VibeConfig;
      
      // Apply vibe to selected component if one is selected
      if (selection.componentId) {
        updateComponent(selection.componentId, { vibe });
      } else {
        // Show result if no component selected
        alert(`Generated vibe: ${JSON.stringify(vibe, null, 2)}\n\nSelect a component to apply this vibe.`);
      }
      
      setPrompt(''); // Clear prompt after use
    } catch (error: any) {
      console.error('AI prompt failed:', error);
      setError(error?.message || 'Failed to generate vibe from prompt.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#00FF9D]" />
          <h4 className="text-xs font-medium text-[#E0E0E0]">AI Tools</h4>
        </div>
        {!hasTracing && (
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="p-1 text-[#888888] hover:text-[#E0E0E0]"
            title="Configure API Key"
          >
            <Settings size={14} />
          </button>
        )}
      </div>

      {/* API Key Configuration */}
      {showApiKeyInput && (
        <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#333333] rounded">
          <label className="text-xs text-[#888888] block mb-2">Gemini API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="flex-1 px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApiKeySave();
                }
              }}
            />
            <button
              onClick={handleApiKeySave}
              className="px-3 py-1 text-xs bg-[#7000FF] text-white rounded hover:bg-[#6000E0]"
            >
              Save
            </button>
          </div>
          <p className="text-[10px] text-[#666666] mt-2">
            Get your API key from{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00FF9D] hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      )}

      {/* Status Indicator */}
      {!hasTracing && !showApiKeyInput && (
        <div className="mb-4 flex items-center gap-2 p-2 bg-[#1A1A1A] border border-[#444444] rounded">
          <AlertCircle size={12} className="text-[#FFAA00]" />
          <span className="text-[10px] text-[#888888]">
            API key not configured. Image tracing will use fallback method.
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-2 bg-[#2A0000] border border-[#660000] rounded">
          <div className="flex items-center gap-2">
            <AlertCircle size={12} className="text-[#FF4444]" />
            <span className="text-[10px] text-[#FF8888]">{error}</span>
          </div>
        </div>
      )}

      {/* Versus Mode Toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={versusMode}
            onChange={(e) => {
              setVersusMode(e.target.checked);
              setVersusResults([]);
            }}
            className="w-3 h-3 rounded border-[#333333] bg-[#121212] text-[#00FF9D] focus:ring-[#00FF9D]"
          />
          <span className="text-xs text-[#E0E0E0]">Versus Mode (Compare Models)</span>
        </label>
      </div>

      {/* Image to Vector */}
      <div className="mb-4">
        <label className="text-xs text-[#888888] block mb-2">Trace Image to SVG</label>
        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#121212] border border-[#333333] rounded cursor-pointer hover:bg-[#2D2D2D] disabled:opacity-50 disabled:cursor-not-allowed">
          <Upload size={14} />
          <span className="text-xs text-[#E0E0E0]">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
        </label>
        {isProcessing && (
          <div className="mt-2">
            <div className="h-1 bg-[#2D2D2D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00FF9D] transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#888888] mt-1 text-center">
              {progress < 0.5 ? 'Processing...' : progress < 1 ? 'Generating SVG...' : 'Complete!'}
            </p>
          </div>
        )}
      </div>

      {/* Prompt to Vibe */}
      <div>
        <label className="text-xs text-[#888888] block mb-2">Prompt to Vibe</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'gentle pulse with green glow'"
            className="flex-1 px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isProcessing && prompt.trim()) {
                handlePromptToVibe();
              }
            }}
          />
          <button
            onClick={handlePromptToVibe}
            disabled={isProcessing || !prompt.trim()}
            className="px-3 py-1 text-xs bg-[#00FF9D] text-[#121212] rounded hover:bg-[#00E08C] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>
        <p className="text-[10px] text-[#666666] mt-1">
          Select a component first to apply the generated vibe
        </p>
      </div>

      {/* Versus Results */}
      {versusMode && versusResults.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#333333]">
          <h5 className="text-xs font-medium text-[#E0E0E0] mb-2">Comparison Results</h5>
          <div className="space-y-2">
            {versusResults.map((result, idx) => (
              <div key={idx} className="p-2 bg-[#1A1A1A] border border-[#333333] rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-[#E0E0E0]">{result.model}</span>
                  <span className="text-[10px] text-[#888888]">{(result.time / 1000).toFixed(2)}s</span>
                </div>
                <div className="text-[10px] text-[#666666]">
                  Size: {(result.svg.length / 1024).toFixed(2)} KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

