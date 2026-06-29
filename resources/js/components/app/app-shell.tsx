import type { ReactNode } from 'react';

import { WorkspaceSidebar } from '@/components/app/workspace-sidebar';
import { WorkspaceTopBar } from '@/components/app/workspace-top-bar';
import type { MarketplaceRole } from '@/config/navigation';
import type { BreadcrumbItem } from '@/types';

export type AppShellProps = {
    role: MarketplaceRole;
    children: ReactNode;
    primaryAction?: unknown;
    showSearch?: boolean;
    headerSlot?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export function AppShell({
    role,
    children,
    showSearch = false,
    headerSlot,
    breadcrumbs = [],
}: AppShellProps): ReactNode {
    const layoutTestId =
        role === 'admin' ? 'admin-dashboard-layout' : `app-shell-${role}`;

    return (
        <div
            className="min-h-screen bg-background text-foreground"
            data-testid={layoutTestId}
        >
            <WorkspaceSidebar role={role} />

            <div className="lg:pl-[248px]">
                <WorkspaceTopBar
                    breadcrumbs={breadcrumbs}
                    headerSlot={headerSlot}
                    role={role}
                    showSearch={showSearch}
                />
                <main
                    className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-8 lg:py-8"
                    data-testid={
                        role === 'admin'
                            ? 'admin-dashboard-main'
                            : 'app-shell-main'
                    }
                >
                    <div className="flex flex-col gap-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
