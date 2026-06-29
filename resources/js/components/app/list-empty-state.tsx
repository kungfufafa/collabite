import type { ReactNode } from 'react';

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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description ? (
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}
