import React from 'react';
import { Sparkles } from 'lucide-react';
import { getSelectedModel, setSelectedModel, AI_MODELS, type AIModel } from '../../utils/apiKeys';

export const ModelSelector: React.FC<{ onModelChange?: (model: AIModel) => void }> = ({ onModelChange }) => {
  const [selectedModel, setSelectedModelState] = React.useState<AIModel>(getSelectedModel());
  const [isOpen, setIsOpen] = React.useState(false);

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
    setSelectedModelState(model);
    setIsOpen(false);
    onModelChange?.(model);
  };

  const currentModelInfo = AI_MODELS[selectedModel];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-[#1A1A1A] border border-[#333333] hover:bg-[#2D2D2D] text-[#E0E0E0]"
        title="Select AI Model"
      >
        <Sparkles size={14} className="text-[#00FF9D]" />
        <span className="font-mono">{currentModelInfo.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 right-0 w-48 bg-[#1A1A1A] border border-[#333333] rounded shadow-lg z-20">
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] text-[#888888] uppercase">AI Models</div>
              {Object.entries(AI_MODELS).map(([modelId, modelInfo]) => (
                <button
                  key={modelId}
                  onClick={() => handleModelChange(modelId as AIModel)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    selectedModel === modelId
                      ? 'bg-[#00FF9D]/20 text-[#00FF9D]'
                      : 'text-[#E0E0E0] hover:bg-[#2D2D2D]'
                  }`}
                >
                  <div className="font-medium">{modelInfo.name}</div>
                  <div className="text-[10px] text-[#666666]">{modelInfo.provider}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

