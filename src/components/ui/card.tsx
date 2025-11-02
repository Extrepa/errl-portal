import React from 'react';

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["rounded-lg border", className].join(' ')} {...props} />;
}
export function CardHeader({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["border-b px-3 py-3", className].join(' ')} {...props} />;
}
export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["font-semibold", className].join(' ')} {...props} />;
}
export function CardContent({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["px-3 py-3", className].join(' ')} {...props} />;
}
