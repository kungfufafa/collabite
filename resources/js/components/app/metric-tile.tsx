import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

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
                'group flex flex-col border-2 border-[var(--neutral-900)] bg-card p-4 shadow-[3px_3px_0_0_var(--neutral-900)] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--neutral-900)]',
                emphasis
                    ? 'bg-[var(--brand-primary-soft)]'
                    : 'bg-card',
            )}
        >
            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        'flex size-8 items-center justify-center border-2 border-[var(--neutral-900)] shadow-[2px_2px_0_0_var(--neutral-900)]',
                        emphasis
                            ? 'bg-[var(--brand-primary)] text-white'
                            : 'bg-white text-[var(--neutral-600)]',
                    )}
                >
                    <Icon className="size-4" />
                </span>
                <ArrowUpRight className="size-4 text-[var(--neutral-400)] transition-colors group-hover:text-[var(--brand-primary)]" />
            </div>
            <span className="mt-3 text-2xl font-black tabular-nums text-foreground">
                {value}
            </span>
            <span className="text-sm font-bold text-foreground">{label}</span>
            <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                {hint}
            </span>
        </Link>
    );
}
