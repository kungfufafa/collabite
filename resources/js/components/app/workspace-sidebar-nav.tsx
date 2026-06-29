import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import type { NavGroup } from '@/config/navigation';
import { isNavigationItemActive } from '@/config/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';

type WorkspaceSidebarNavProps = {
    groups: NavGroup[];
    className?: string;
    onNavigate?: () => void;
};

export function WorkspaceSidebarNav({
    groups,
    className,
    onNavigate,
}: WorkspaceSidebarNavProps): ReactNode {
    const { currentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label="Navigasi utama"
            className={cn(className)}
        >
            {groups.map((group, groupIndex) => (
                <div key={group.heading ?? `group-${groupIndex}`} className={groupIndex > 0 ? 'mt-5' : ''}>
                    {group.heading ? (
                        <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--neutral-400)]">
                            {group.heading}
                        </p>
                    ) : null}
                    <ul className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                            const active = isNavigationItemActive(
                                item,
                                currentUrl,
                            );
                            const Icon = item.icon;

                            return (
                                <li key={item.label}>
                                    <Link
                                        href={toUrl(item.href)}
                                        prefetch
                                        data-active={active ? 'true' : 'false'}
                                        data-testid={`app-shell-nav-${item.label}`}
                                        onClick={onNavigate}
                                        className={cn(
                                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]'
                                                : 'text-[var(--neutral-600)] hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        {Icon ? (
                                            <Icon className="size-[1.05rem] shrink-0" />
                                        ) : null}
                                        <span className="flex-1 truncate">
                                            {item.label}
                                        </span>
                                        {item.badge ? (
                                            <span
                                                aria-label={`${item.badge} item butuh perhatian`}
                                                className={cn(
                                                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
                                                    active
                                                        ? 'bg-[var(--brand-primary)] text-white'
                                                        : 'bg-[var(--neutral-200)] text-[var(--neutral-700)]',
                                                )}
                                            >
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
}
