import type { ReactNode } from 'react';

import { AppShell } from '@/components/app/app-shell';
import type { AppShellProps } from '@/components/app/app-shell';

export type MarketplaceLayoutProps = Omit<AppShellProps, 'role'> & {
    role: AppShellProps['role'];
    extraNav?: never;
    brandName?: never;
};

export default function MarketplaceLayout({
    children,
    role,
    primaryAction,
    showSearch,
    headerSlot,
}: MarketplaceLayoutProps): ReactNode {
    return (
        <AppShell
            role={role}
            primaryAction={primaryAction}
            showSearch={showSearch}
            headerSlot={headerSlot}
        >
            {children}
        </AppShell>
    );
}
