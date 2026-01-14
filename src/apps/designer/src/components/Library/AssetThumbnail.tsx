import React from 'react';
import type { Asset } from '../../state/types';

interface AssetThumbnailProps {
  asset: Asset;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AssetThumbnail: React.FC<AssetThumbnailProps> = ({
  asset,
  onClick,
  isSelected = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]} cursor-pointer rounded border transition-colors
        ${isSelected 
          ? 'border-[#00FF9D] bg-[#2D2D2D]' 
          : 'border-[#333333] bg-[#121212] hover:border-[#00FF9D]'
        }
      `}
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden p-1">
        <div 
          className="w-full h-full"
          style={{ transform: 'scale(0.8)' }}
          dangerouslySetInnerHTML={{ __html: asset.data }}
        />
      </div>
    </div>
  );
};

