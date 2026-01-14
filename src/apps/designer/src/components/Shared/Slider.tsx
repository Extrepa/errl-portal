import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  valueLabel,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-2">
      {label && (
        <label className="text-xs text-[#888888] block mb-1">
          {label}{valueLabel && `: ${valueLabel}`}
        </label>
      )}
      <input
        type="range"
        className={`w-full ${className}`}
        {...props}
      />
    </div>
  );
};

