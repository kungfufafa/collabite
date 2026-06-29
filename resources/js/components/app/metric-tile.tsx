import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn, toUrl } from '@/lib/utils';

type MetricTileProps = {
    label: string;
    value: number | string;
    hint: string;
    icon: LucideIcon;
    href: NonNullable<InertiaLinkProps['href']>;
    emphasis?: boolean;
};

export function MetricTile({
    label,
    value,
    hint,
    icon: Icon,
    href,
    emphasis = false,
}: MetricTileProps): ReactNode {
    return (
        <Link
            href={href}
            prefetch
            className={cn(
                'group flex flex-col rounded-xl border bg-card p-4 transition-colors hover:border-[var(--brand-primary-muted)]',
                emphasis
                    ? 'border-[var(--brand-primary-muted)]'
                    : 'border-border',
            )}
        >
            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        'flex size-8 items-center justify-center rounded-md',
                        emphasis
                            ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]'
                            : 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
                    )}
                >
                    <Icon className="size-4" />
                </span>
                <ArrowUpRight className="size-4 text-[var(--neutral-400)] transition-colors group-hover:text-[var(--brand-primary)]" />
            </div>
            <span className="mt-3 text-2xl font-bold tabular-nums text-foreground">
                {value}
            </span>
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">{hint}</span>
        </Link>
    );
}
