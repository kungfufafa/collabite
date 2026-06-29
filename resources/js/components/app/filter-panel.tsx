import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type FilterPanelProps = {
    title?: string;
    children: ReactNode;
    className?: string;
};

export function FilterPanel({
    title = 'Filter',
    children,
    className,
}: FilterPanelProps): ReactNode {
    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card p-4 sm:p-5',
                className,
            )}
        >
            <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>
            {children}
        </div>
    );
}
