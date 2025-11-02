import React, { forwardRef } from 'react';

export const ScrollArea = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return <div ref={ref} className={["overflow-auto", className].join(' ')} {...props} />;
  }
);
ScrollArea.displayName = 'ScrollArea';
