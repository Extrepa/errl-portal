import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export function Button({ variant = 'default', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md border transition-colors';
  const variants: Record<string, string> = {
    default: 'bg-white/10 border-white/10 hover:bg-white/20',
    outline: 'bg-transparent border-white/20 hover:bg-white/10',
    secondary: 'bg-purple-600/20 border-purple-400/30 hover:bg-purple-600/30',
    destructive: 'bg-red-600/30 border-red-400/40 hover:bg-red-600/40',
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4',
    icon: 'h-9 w-9 p-0',
  };
  return <button className={[base, variants[variant], sizes[size], className].join(' ')} {...props} />;
}
