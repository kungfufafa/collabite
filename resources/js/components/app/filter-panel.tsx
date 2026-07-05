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
                'brutal-surface border-2 border-[var(--neutral-900)] bg-card p-4 shadow-[3px_3px_0_0_var(--neutral-900)] sm:p-5',
                className,
            )}
        >
            <p className="mb-4 text-sm font-black uppercase tracking-wide text-foreground">
                {title}
            </p>
            {children}
        </div>
    );
}
