import type { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    meta?: ReactNode;
};

export function PageHeader({
    title,
    description,
    actions,
    meta,
}: PageHeaderProps): ReactNode {
    return (
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {title}
                </h1>
                {description ? (
                    <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
                {meta ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {meta}
                    </div>
                ) : null}
            </div>
            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            ) : null}
        </div>
    );
}
