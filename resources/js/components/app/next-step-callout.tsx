import type { ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { cn } from '@/lib/utils';

type NextStepCalloutProps = {
    label?: string;
    description: string;
    action?: ReactNode;
    className?: string;
    compact?: boolean;
};

export function NextStepCallout({
    label = 'Langkah berikutnya',
    description,
    action,
    className,
    compact = false,
}: NextStepCalloutProps): ReactNode {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 border-2 border-[var(--neutral-900)] bg-[var(--brand-primary-soft)] shadow-[3px_3px_0_0_var(--neutral-900)]',
                compact ? 'p-3 sm:flex-row sm:items-center sm:justify-between' : 'p-4 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
            data-testid="next-step-callout"
        >
            <div className="min-w-0">
                <StatusBadge label={label} tone="warning" />
                <p className="mt-2 text-sm font-medium text-foreground">{description}</p>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
