import type { ReactNode } from 'react';

import { brutalEmptyState } from '@/components/collabite/landing/brutal-styles';

type ListEmptyStateProps = {
    title: string;
    description?: string;
    action?: ReactNode;
};

export function ListEmptyState({
    title,
    description,
    action,
}: ListEmptyStateProps): ReactNode {
    return (
        <div className={brutalEmptyState}>
            <p className="text-sm font-black uppercase tracking-wide text-foreground">
                {title}
            </p>
            {description ? (
                <p className="mt-1.5 max-w-sm text-sm font-medium text-muted-foreground">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}
