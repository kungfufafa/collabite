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
                'rounded-xl border border-border bg-card p-4 transition-colors',
                className,
            )}
        >
            {children}
        </div>
    );
}
