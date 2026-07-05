import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    eyebrow?: string;
    description?: string;
    actions?: ReactNode;
    meta?: ReactNode;
    titleUppercase?: boolean;
};

export function PageHeader({
    title,
    eyebrow,
    description,
    actions,
    meta,
    titleUppercase = true,
}: PageHeaderProps): ReactNode {
    return (
        <div className="flex flex-col gap-4 border-b-[3px] border-[var(--neutral-900)] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                {eyebrow ? (
                    <p className="mb-2 text-sm font-bold text-[var(--brand-primary)]">
                        {eyebrow}
                    </p>
                ) : null}
                <h1
                    className={cn(
                        'text-xl font-black tracking-tight text-foreground sm:text-2xl',
                        titleUppercase && 'uppercase',
                    )}
                >
                    {title}
                </h1>
                {description ? (
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
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
