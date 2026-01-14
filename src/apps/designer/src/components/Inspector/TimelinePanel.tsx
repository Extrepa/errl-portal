import React, { useEffect, useRef } from 'react';
import { Clock, Repeat } from 'lucide-react';
import { useStore } from '../../state/useStore';

export const TimelinePanel: React.FC = () => {
  const { timeline, setTimeline, toggleTimelineLoop, seekTimeline } = useStore();
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Update timeline when playing
  useEffect(() => {
    if (!timeline.isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const updateTimeline = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      
      if (lastUpdateRef.current > 0) {
        const newTime = timeline.currentTime + (deltaTime * timeline.playbackSpeed);
        
        if (timeline.loop) {
          // Loop: wrap around
          const normalizedTime = newTime % timeline.duration;
          setTimeline({ currentTime: normalizedTime });
        } else {
          // No loop: stop at end
          if (newTime >= timeline.duration) {
            setTimeline({ currentTime: timeline.duration, isPlaying: false });
            return;
          }
          setTimeline({ currentTime: newTime });
        }
      }
      
      lastUpdateRef.current = now;
      animationFrameRef.current = requestAnimationFrame(updateTimeline);
    };

    lastUpdateRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateTimeline);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [timeline.isPlaying, timeline.playbackSpeed, timeline.loop, timeline.duration]);

  // Reset lastUpdate when playback starts/stops
  useEffect(() => {
    if (!timeline.isPlaying) {
      lastUpdateRef.current = 0;
    }
  }, [timeline.isPlaying]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseFloat(e.target.value);
    setTimeline({ duration: Math.max(1, newDuration) });
    // Clamp current time if it exceeds new duration
    if (timeline.currentTime > newDuration) {
      seekTimeline(newDuration);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTimeline(time);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
  };

  return (
    <div className="p-4 border-t border-[#333333]">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-[#FF007A]" />
        <h4 className="text-xs font-medium text-[#E0E0E0]">Timeline</h4>
      </div>

      {/* Duration Control */}
      <div className="mb-4">
        <label className="text-xs text-[#888888] block mb-2">
          Duration: {timeline.duration.toFixed(1)}s
        </label>
        <input
          type="range"
          min="1"
          max="60"
          step="0.1"
          value={timeline.duration}
          onChange={handleDurationChange}
          className="w-full h-1 bg-[#2D2D2D] rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Current Time Scrubber */}
      <div className="mb-4">
        <label className="text-xs text-[#888888] block mb-2">
          Time: {formatTime(timeline.currentTime)}
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max={timeline.duration}
            step="0.1"
            value={timeline.currentTime}
            onChange={handleTimeChange}
            className="w-full h-2 bg-[#2D2D2D] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF007A 0%, #FF007A ${(timeline.currentTime / timeline.duration) * 100}%, #2D2D2D ${(timeline.currentTime / timeline.duration) * 100}%, #2D2D2D 100%)`,
            }}
          />
        </div>
      </div>

      {/* Loop Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-[#888888]">Loop</label>
        <button
          onClick={toggleTimelineLoop}
          className={`p-2 rounded ${
            timeline.loop
              ? 'bg-[#FF007A] text-white'
              : 'bg-[#2D2D2D] text-[#888888] hover:bg-[#3D3D3D]'
          }`}
          title={timeline.loop ? 'Disable Loop' : 'Enable Loop'}
        >
          <Repeat size={14} />
        </button>
      </div>

      {/* Time Ruler (Visual Guide) */}
      <div className="mt-4 pt-4 border-t border-[#333333]">
        <div className="text-xs text-[#666666] mb-2">Time Scale</div>
        <div className="relative h-8 bg-[#1A1A1A] rounded border border-[#333333]">
          {Array.from({ length: Math.ceil(timeline.duration) + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-[#444444]"
              style={{ left: timeline.duration > 0 ? `${(i / timeline.duration) * 100}%` : '0%' }}
            >
              <div className="absolute -bottom-4 left-0 text-[10px] text-[#666666] font-mono transform -translate-x-1/2">
                {i}s
              </div>
            </div>
          ))}
          {/* Playhead Indicator */}
          <div
            className="absolute top-0 w-0.5 h-full bg-[#FF007A] z-10"
            style={{ left: timeline.duration > 0 ? `${(timeline.currentTime / timeline.duration) * 100}%` : '0%' }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#FF007A] rounded-full border-2 border-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

