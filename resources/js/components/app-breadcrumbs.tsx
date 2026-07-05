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
            className="inline-flex min-w-0 items-center gap-2 border-2 border-[var(--neutral-900)] bg-[var(--brand-primary-soft)] px-2 py-1 shadow-[2px_2px_0_0_var(--neutral-900)] sm:gap-2.5 sm:px-3 sm:py-1.5"
            data-testid="app-breadcrumb"
        >
            {Icon ? (
                <span className="flex size-7 shrink-0 items-center justify-center border-2 border-[var(--neutral-900)] bg-[var(--brand-primary)] text-white shadow-[1px_1px_0_0_var(--neutral-900)]">
                    <Icon className="size-3.5" strokeWidth={2.5} />
                </span>
            ) : null}
            <span className="truncate text-xs font-black uppercase tracking-wide text-[var(--brand-primary-active)]">
                {page.title}
            </span>
        </div>
    );
}
