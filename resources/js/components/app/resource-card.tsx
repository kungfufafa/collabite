import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ResourceCardProps = {
    children: ReactNode;
    className?: string;
};

export function ResourceCard({
    children,
    className,
}: ResourceCardProps): ReactNode {
    return (
        <div
            className={cn(
                'brutal-surface border-2 border-[var(--neutral-900)] bg-card p-4 shadow-[3px_3px_0_0_var(--neutral-900)] transition-transform duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--neutral-900)]',
                className,
            )}
        >
            {children}
        </div>
    );
}
