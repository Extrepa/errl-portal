import { useEffect, useState } from 'react';
import './ErrlAvatar.css';

interface ErrlAvatarProps {
  isThinking?: boolean;
  size?: number;
}

export default function ErrlAvatar({ isThinking = false, size = 48 }: ErrlAvatarProps) {
  const [glowIntensity, setGlowIntensity] = useState(1);

  useEffect(() => {
    if (isThinking) {
      // Pulse glow when thinking
      const interval = setInterval(() => {
        setGlowIntensity(prev => (prev === 1 ? 0.7 : 1));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setGlowIntensity(1);
    }
  }, [isThinking]);

  return (
    <div 
      className="errl-avatar" 
      style={{ 
        width: size, 
        height: size,
        opacity: glowIntensity 
      }}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="errl-avatar-svg"
      >
        {/* Errl body - teardrop shape */}
        <defs>
          <linearGradient id="errlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffff" />
            <stop offset="100%" stopColor="#ff00ff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main body - teardrop */}
        <path
          d="M 50 20 Q 70 30 75 50 Q 75 70 50 85 Q 25 70 25 50 Q 30 30 50 20 Z"
          fill="url(#errlGradient)"
          filter="url(#glow)"
          className="errl-body"
        />
        
        {/* Face - permanent wide-eyed awe */}
        <circle cx="40" cy="45" r="6" fill="#ffffff" className="errl-eye" />
        <circle cx="60" cy="45" r="6" fill="#ffffff" className="errl-eye" />
        <circle cx="40" cy="45" r="3" fill="#000000" />
        <circle cx="60" cy="45" r="3" fill="#000000" />
        
        {/* Simple mouth - always in awe */}
        <ellipse cx="50" cy="60" rx="8" ry="4" fill="#ffffff" opacity="0.8" />
      </svg>
    </div>
  );
}
