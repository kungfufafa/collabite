import type { ReactNode } from 'react';

import { CollabiteAppHeader } from '@/components/app/collabite-app-header';
import { CollabiteAppSidebar } from '@/components/app/collabite-app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
    const mainTestId =
        role === 'admin' ? 'admin-dashboard-main' : 'app-shell-main';

    return (
        <div
            className="min-h-screen bg-background text-foreground"
            data-testid={layoutTestId}
        >
            <SidebarProvider>
                <CollabiteAppSidebar role={role} />
                <SidebarInset className="min-w-0 overflow-x-hidden p-4 md:p-6">
                    <CollabiteAppHeader
                        breadcrumbs={breadcrumbs}
                        headerSlot={headerSlot}
                        role={role}
                        showSearch={showSearch}
                    />
                    <main
                        className="mx-auto flex w-full min-w-0 max-w-[1440px] flex-1 flex-col gap-8"
                        data-testid={mainTestId}
                    >
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
