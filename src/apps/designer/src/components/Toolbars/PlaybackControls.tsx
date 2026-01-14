import React from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { useStore } from '../../state/useStore';

export const PlaybackControls: React.FC = () => {
  const {
    timeline,
    playTimeline,
    pauseTimeline,
    stopTimeline,
    seekTimeline,
    setTimelineSpeed,
  } = useStore();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.25, 0.5, 1, 2, 4];

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTimeline(time);
  };

  const handlePreviousFrame = () => {
    seekTimeline(Math.max(0, timeline.currentTime - 0.1));
  };

  const handleNextFrame = () => {
    seekTimeline(Math.min(timeline.duration, timeline.currentTime + 0.1));
  };

  const handleJumpToStart = () => {
    seekTimeline(0);
  };

  const handleJumpToEnd = () => {
    seekTimeline(timeline.duration);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#333333] bg-[#0A0A0A]">
      {/* Play/Pause/Stop */}
      <div className="flex items-center gap-1">
        <button
          onClick={timeline.isPlaying ? pauseTimeline : playTimeline}
          className="p-2 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
          title={timeline.isPlaying ? 'Pause' : 'Play'}
        >
          {timeline.isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={stopTimeline}
          className="p-2 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
          title="Stop"
        >
          <Square size={14} />
        </button>
      </div>

      {/* Frame Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleJumpToStart}
          className="p-1.5 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
          title="Jump to Start"
        >
          <SkipBack size={14} />
        </button>
        <button
          onClick={handlePreviousFrame}
          className="p-1.5 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
          title="Previous Frame"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={handleNextFrame}
          className="p-1.5 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
          title="Next Frame"
        >
          <SkipForward size={14} />
        </button>
        <button
          onClick={handleJumpToEnd}
          className="p-1.5 rounded text-[#888888] hover:bg-[#2D2D2D] hover:text-[#E0E0E0]"
          title="Jump to End"
        >
          <SkipForward size={14} className="rotate-180" />
        </button>
      </div>

      {/* Time Display and Scrubber */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs text-[#888888] font-mono min-w-[60px]">
          {formatTime(timeline.currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={timeline.duration}
          step="0.1"
          value={timeline.currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-[#2D2D2D] rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #00FF9D 0%, #00FF9D ${(timeline.currentTime / timeline.duration) * 100}%, #2D2D2D ${(timeline.currentTime / timeline.duration) * 100}%, #2D2D2D 100%)`,
          }}
        />
        <span className="text-xs text-[#888888] font-mono min-w-[60px]">
          {formatTime(timeline.duration)}
        </span>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-[#888888]">Speed:</span>
        <select
          value={timeline.playbackSpeed}
          onChange={(e) => setTimelineSpeed(parseFloat(e.target.value))}
          className="px-2 py-1 text-xs bg-[#121212] border border-[#333333] rounded text-[#E0E0E0]"
        >
          {speedOptions.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

