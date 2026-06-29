import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type DashboardGridProps = {
    children: ReactNode;
    className?: string;
    testId?: string;
};

export function DashboardGrid({
    children,
    className,
    testId,
}: DashboardGridProps): ReactNode {
    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4',
                className,
            )}
            data-testid={testId}
        >
            {children}
        </div>
    );
}
