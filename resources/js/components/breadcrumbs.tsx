import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';

import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}): ReactNode {
    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" className="min-w-0" data-testid="breadcrumbs">
            <ol className="flex flex-wrap items-center gap-2">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <Fragment key={index}>
                            {index > 0 ? (
                                <li aria-hidden className="text-[var(--neutral-900)]">
                                    <ChevronRight className="size-3.5" strokeWidth={2.5} />
                                </li>
                            ) : null}
                            <li className="min-w-0">
                                {isLast ? (
                                    <span
                                        aria-current="page"
                                        className="inline-flex max-w-full truncate border-2 border-[var(--neutral-900)] bg-[var(--brand-primary-soft)] px-2 py-1 text-xs font-black uppercase tracking-wide text-[var(--brand-primary-active)] shadow-[2px_2px_0_0_var(--neutral-900)] sm:px-3"
                                    >
                                        {item.title}
                                    </span>
                                ) : (
                                    <Link
                                        className="inline-flex max-w-full truncate border-2 border-[var(--neutral-900)] bg-card px-2 py-1 text-xs font-bold uppercase tracking-wide text-foreground shadow-[2px_2px_0_0_var(--neutral-900)] transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--neutral-900)] sm:px-3"
                                        href={item.href}
                                        prefetch
                                    >
                                        {item.title}
                                    </Link>
                                )}
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
