import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { brutalPanel } from '@/components/collabite/landing/brutal-styles';
import { cn } from '@/lib/utils';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TablePaginationProps = {
    links: PaginationLink[];
    className?: string;
};

export function TablePagination({
    links,
    className,
}: TablePaginationProps): ReactNode {
    if (links.length <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Paginasi tabel"
            className={cn(
                brutalPanel,
                'flex flex-wrap items-center justify-center gap-2 border-t-0 px-4 py-3',
                className,
            )}
            data-testid="table-pagination"
        >
            {links.map((link, index) => (
                <Link
                    className={cn(
                        'border-2 px-3 py-1.5 text-sm font-bold transition-[transform,box-shadow]',
                        link.active
                            ? 'border-[var(--neutral-900)] bg-[var(--brand-primary)] text-white shadow-[2px_2px_0_0_var(--neutral-900)]'
                            : link.url
                              ? 'border-[var(--neutral-900)] bg-white text-foreground shadow-[2px_2px_0_0_var(--neutral-900)] hover:-translate-x-px hover:-translate-y-px'
                              : 'cursor-not-allowed border-[var(--neutral-300)] text-muted-foreground opacity-50 shadow-none',
                    )}
                    href={link.url ?? '#'}
                    key={`${link.label}-${index}`}
                    preserveState
                    preserveScroll
                >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Link>
            ))}
        </nav>
    );
}
