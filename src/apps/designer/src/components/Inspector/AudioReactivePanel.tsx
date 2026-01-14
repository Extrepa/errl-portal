import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useStore } from '../../state/useStore';
import { getAudioReactiveService } from '../../engine/audioReactive';
import type { AudioReactiveConfig } from '../../state/types';

export const AudioReactivePanel: React.FC = () => {
  const { selection, project, updateComponent } = useStore();
  const [isActive, setIsActive] = useState(false);
  const [audioValues, setAudioValues] = useState({ bass: 0, mid: 0, treble: 0 });

  const selectedComponent = selection.componentId 
    ? project?.library.components.find(c => c.id === selection.componentId)
    : null;

  const audioConfig = selectedComponent?.vibe?.audioReactive;

  useEffect(() => {
    if (!isActive) return;

    const audioService = getAudioReactiveService();
    const interval = setInterval(() => {
      setAudioValues({
        bass: audioService.getFrequencyData('bass'),
        mid: audioService.getFrequencyData('mid'),
        treble: audioService.getFrequencyData('treble'),
      });
    }, 50); // Update every 50ms

    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggle = async () => {
    const audioService = getAudioReactiveService();
    if (isActive) {
      audioService.stop();
      setIsActive(false);
    } else {
      try {
        await audioService.start();
        setIsActive(true);
      } catch (error) {
        console.error('Failed to start audio:', error);
        alert('Failed to access microphone. Please check permissions.');
      }
    }
  };

  const handleEnableAudioReactive = () => {
    if (!selectedComponent) return;
    
    const defaultConfig: AudioReactiveConfig = {
      parameter: 'intensity',
      frequencyBand: 'bass',
      multiplier: 1.0,
      smoothing: 0.8,
    };

    updateComponent(selectedComponent.id, {
      vibe: {
        ...selectedComponent.vibe,
        audioReactive: defaultConfig,
      },
    });
  };

  const handleUpdateConfig = (updates: Partial<AudioReactiveConfig>) => {
    if (!selectedComponent || !audioConfig) return;
    
    updateComponent(selectedComponent.id, {
      vibe: {
        ...selectedComponent.vibe,
        audioReactive: { ...audioConfig, ...updates },
      },
    });
  };

  if (!selectedComponent) {
    return (
      <div className="p-4">
        <p className="text-xs text-[#888888]">Select a component to configure audio-reactive vibes</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-medium text-[#E0E0E0]">Audio-Reactive</h4>
        <button
          onClick={handleToggle}
          className={`p-2 rounded transition-colors ${
            isActive
              ? 'bg-[#00FF9D] text-[#121212]'
              : 'bg-[#121212] text-[#888888] hover:bg-[#2D2D2D]'
          }`}
          title={isActive ? 'Stop audio input' : 'Start audio input'}
        >
          {isActive ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
      </div>

      {!audioConfig ? (
        <button
          onClick={handleEnableAudioReactive}
          className="w-full px-3 py-2 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0] hover:bg-[#2D2D2D]"
        >
          Enable Audio-Reactive
        </button>
      ) : (
        <div className="space-y-3">
          {/* Parameter Selection */}
          <div>
            <label className="text-xs text-[#888888] block mb-1">Parameter</label>
            <select
              value={audioConfig.parameter}
              onChange={(e) => handleUpdateConfig({ parameter: e.target.value })}
              className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            >
              <option value="intensity">Intensity</option>
              <option value="speed">Speed</option>
              <option value="radius">Radius</option>
              <option value="amplitude">Amplitude</option>
            </select>
          </div>

          {/* Frequency Band */}
          <div>
            <label className="text-xs text-[#888888] block mb-1">Frequency Band</label>
            <select
              value={audioConfig.frequencyBand}
              onChange={(e) => handleUpdateConfig({ frequencyBand: e.target.value as any })}
              className="w-full px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
            >
              <option value="bass">Bass (0-100Hz)</option>
              <option value="mid">Mid (100-500Hz)</option>
              <option value="treble">Treble (500Hz+)</option>
            </select>
          </div>

          {/* Multiplier */}
          <div>
            <label className="text-xs text-[#888888] block mb-1">
              Multiplier: {audioConfig.multiplier.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={audioConfig.multiplier}
              onChange={(e) => handleUpdateConfig({ multiplier: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Audio Level Visualization */}
          {isActive && (
            <div className="space-y-2 pt-2 border-t border-[#333333]">
              <div className="text-xs text-[#888888] mb-2">Audio Levels</div>
              <div className="space-y-1">
                <div>
                  <div className="flex justify-between text-[10px] text-[#666666] mb-0.5">
                    <span>Bass</span>
                    <span>{(audioValues.bass * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[#121212] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#00FF9D] transition-all"
                      style={{ width: `${audioValues.bass * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-[#666666] mb-0.5">
                    <span>Mid</span>
                    <span>{(audioValues.mid * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[#121212] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#00FF9D] transition-all"
                      style={{ width: `${audioValues.mid * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-[#666666] mb-0.5">
                    <span>Treble</span>
                    <span>{(audioValues.treble * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[#121212] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#00FF9D] transition-all"
                      style={{ width: `${audioValues.treble * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (!selectedComponent) return;
              updateComponent(selectedComponent.id, {
                vibe: {
                  ...selectedComponent.vibe,
                  audioReactive: undefined,
                },
              });
            }}
            className="w-full px-3 py-2 text-xs bg-[#121212] border border-red-500/50 rounded text-red-400 hover:bg-[#2D2D2D]"
          >
            Disable Audio-Reactive
          </button>
        </div>
      )}
    </div>
  );
};

