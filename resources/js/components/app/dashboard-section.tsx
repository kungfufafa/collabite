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
        <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>
                {action ? (
                    <Link
                        href={action.href}
                        prefetch
                        className="shrink-0 text-sm font-medium text-[var(--brand-primary-hover)] hover:underline"
                    >
                        {action.label}
                    </Link>
                ) : null}
            </div>
            {children}
        </section>
    );
}
