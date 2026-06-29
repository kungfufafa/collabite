import * as React from 'react';
import { cn } from '@/lib/utils';

type TabsContextType = { value: string; setValue: (v: string) => void };
const TabsContext = React.createContext<TabsContextType | null>(null);

function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string }) {
    return (
        <TabsContext.Provider value={{ value, setValue: onValueChange }}>
            <div className={cn(className)}>{children}</div>
        </TabsContext.Provider>
    );
}

function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('inline-flex items-center gap-2', className)}>{children}</div>;
}

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
    const ctx = React.useContext(TabsContext);
    if (!ctx) return null;
    const active = ctx.value === value;
    return (
        <button
            type="button"
            onClick={() => ctx.setValue(value)}
            className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                className,
            )}
        >
            {children}
        </button>
    );
}

function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
    const ctx = React.useContext(TabsContext);
    if (!ctx || ctx.value !== value) return null;
    return <div className="mt-4">{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
