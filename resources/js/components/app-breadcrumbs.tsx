import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Current page segment shown in the header — pass a nav item or `{ title, icon? }`. */
export type AppBreadcrumbPage = {
    title: string;
    icon?: LucideIcon | null;
};

export function AppBreadcrumbs({ page }: { page?: AppBreadcrumbPage | null }): ReactNode {
    if (!page?.title) {
        return null;
    }

    const Icon = page.icon ?? null;

    return (
        <div
            aria-current="page"
            className="inline-flex h-9 min-w-0 items-center gap-2 border-2 border-[var(--neutral-900)] bg-[var(--brand-primary-soft)] px-3 shadow-[2px_2px_0_0_var(--neutral-900)]"
            data-testid="app-breadcrumb"
        >
            {Icon ? (
                <Icon
                    className="size-4 shrink-0 text-[var(--brand-primary)]"
                    strokeWidth={2.5}
                />
            ) : null}
            <span className="truncate text-xs font-black uppercase tracking-wide text-[var(--brand-primary-active)]">
                {page.title}
            </span>
        </div>
    );
}
