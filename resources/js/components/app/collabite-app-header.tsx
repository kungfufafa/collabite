'use client';

import type { ReactNode } from 'react';

import { CustomSidebarTrigger } from '@/components/app/custom-sidebar-trigger';
import { NotificationsMenu } from '@/components/app/notifications-menu';
import { AppBreadcrumbs } from '@/components/app-breadcrumbs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NavUser } from '@/components/nav-user';
import {
    getNavigationForRole,
    isNavigationItemActive,
    type MarketplaceRole,
} from '@/config/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type CollabiteAppHeaderProps = {
    role: MarketplaceRole;
    showSearch?: boolean;
    headerSlot?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

const SEARCH_PLACEHOLDER: Record<MarketplaceRole, string> = {
    umkm: 'Cari creator atau campaign...',
    creator: 'Cari campaign...',
    admin: 'Cari...',
};

export function CollabiteAppHeader({
    role,
    showSearch = false,
    headerSlot,
    breadcrumbs = [],
}: CollabiteAppHeaderProps): ReactNode {
    const { currentUrl } = useCurrentUrl();

    const activeNavItem = getNavigationForRole(role).find((item) =>
        isNavigationItemActive(item, currentUrl),
    );

    const breadcrumbPage =
        breadcrumbs.length > 0
            ? null
            : activeNavItem
              ? { title: activeNavItem.label, icon: activeNavItem.icon }
              : null;

    return (
        <header
            className={cn(
                'mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--neutral-900)] pb-4',
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <CustomSidebarTrigger />
                {breadcrumbs.length > 0 ? (
                    <div className="min-w-0 flex-1">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                ) : breadcrumbPage ? (
                    <div className="min-w-0 flex-1">
                        <AppBreadcrumbs page={breadcrumbPage} />
                    </div>
                ) : null}
            </div>

            {showSearch ? (
                <div className="hidden max-w-md flex-1 items-center gap-2 border-2 border-[var(--neutral-900)] bg-card px-3 shadow-[2px_2px_0_0_var(--neutral-900)] md:flex">
                    <input
                        aria-label="Cari"
                        className="w-full bg-transparent py-2 text-sm font-medium outline-none placeholder:text-muted-foreground"
                        data-testid="app-shell-search"
                        placeholder={SEARCH_PLACEHOLDER[role]}
                    />
                </div>
            ) : null}

            <div className="flex shrink-0 items-center gap-2">
                {headerSlot}
                <NotificationsMenu />
                <div
                    aria-hidden
                    className="hidden h-8 w-[2px] bg-[var(--neutral-900)] sm:block"
                />
                <NavUser role={role} />
            </div>
        </header>
    );
}
