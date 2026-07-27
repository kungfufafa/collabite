import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageActionGroupProps = {
    children: ReactNode;
    className?: string;
};

/**
 * Groups page header actions. Callers should put at most one default/primary Button here.
 */
export function PageActionGroup({
    children,
    className,
}: PageActionGroupProps): ReactNode {
    return (
        <div
            className={cn('flex shrink-0 flex-wrap items-center gap-2', className)}
            data-testid="page-action-group"
        >
            {children}
        </div>
    );
}
