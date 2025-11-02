import React, { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = forwardRef<HTMLInputElement, InputProps>(function InputImpl({ className = '', ...props }, ref) {
  return <input ref={ref} className={["border rounded-md px-2 py-1", className].join(' ')} {...props} />;
});
