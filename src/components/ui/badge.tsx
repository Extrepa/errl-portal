import React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary';
};

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded px-2 py-0.5 text-xs border';
  const variants: Record<string, string> = {
    default: 'bg-white/10 border-white/20',
    secondary: 'bg-white/10 border-white/20',
  };
  return <span className={[base, variants[variant], className].join(' ')} {...props} />;
}
