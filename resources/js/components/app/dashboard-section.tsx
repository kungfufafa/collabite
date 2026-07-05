import type { InertiaLinkProps } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type DashboardSectionProps = {
    title: string;
    description?: string;
    action?: {
        label: string;
        href: NonNullable<InertiaLinkProps['href']>;
    };
    children: ReactNode;
};

export function DashboardSection({
    title,
    description,
    action,
    children,
}: DashboardSectionProps): ReactNode {
    return (
        <section className="flex flex-col gap-6">
            <div>
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base font-black uppercase tracking-wide text-foreground">
                        {title}
                    </h2>
                    {action ? (
                        <Link
                            className="shrink-0 text-sm font-bold text-[var(--brand-primary-hover)] hover:underline"
                            href={action.href}
                            prefetch
                        >
                            {action.label}
                        </Link>
                    ) : null}
                </div>
                {description ? (
                    <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            <div className="brutal-surface border-2 border-[var(--neutral-900)] bg-card p-5 shadow-[3px_3px_0_0_var(--neutral-900)] sm:p-6">
                {children}
            </div>
        </section>
    );
}
