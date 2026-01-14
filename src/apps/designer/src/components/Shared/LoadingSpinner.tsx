import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-6 h-6 border-2 border-[#00FF9D] border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

