import type { ReactNode } from 'react';

import { AppShell } from '@/components/app/app-shell';
import type { BreadcrumbItem } from '@/types';

export type AdminDashboardLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export default function AdminDashboardLayout({
    children,
    breadcrumbs = [],
}: AdminDashboardLayoutProps): ReactNode {
    return (
        <AppShell role="admin" breadcrumbs={breadcrumbs}>
            {children}
        </AppShell>
    );
}
