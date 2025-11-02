import React, { createContext, useContext, useMemo, useState } from 'react';

type TabsContextType = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
};

export function Tabs({ defaultValue, value: valueProp, onValueChange, className = '', children, ...rest }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue || '');
  const value = valueProp ?? internal;
  const setValue = (v: string) => { setInternal(v); onValueChange?.(v); };
  const ctx = useMemo(() => ({ value, setValue }), [value]);
  return (
    <TabsContext.Provider value={ctx}>
      <div className={className} {...rest}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["inline-flex gap-1 p-1 rounded-md", className].join(' ')} {...props} />;
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string };
export function TabsTrigger({ value, className = '', ...props }: TriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const active = ctx.value === value;
  const base = 'px-3 py-1 rounded text-sm border';
  const style = active ? 'bg-white/15 border-white/20' : 'bg-transparent border-white/10 hover:bg-white/10';
  return (
    <button className={[base, style, className].join(' ')} onClick={() => ctx.setValue(value)} {...props} />
  );
}

type ContentProps = React.HTMLAttributes<HTMLDivElement> & { value: string };
export function TabsContent({ value, className = '', ...props }: ContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;
  return <div className={className} {...props} />;
}
