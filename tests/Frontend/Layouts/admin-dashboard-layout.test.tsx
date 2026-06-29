import type * as Inertia from '@inertiajs/react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';
import AdminDashboardLayout from '@/layouts/admin-dashboard-layout';

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual<typeof Inertia>('@inertiajs/react');

    return {
        ...actual,
        usePage: () => ({
            url: '/admin/dashboard',
            props: {
                auth: {
                    user: {
                        id: 99,
                        name: 'Admin Sari',
                        email: 'admin@collabite.id',
                        avatar: null,
                    },
                },
                sidebarOpen: true,
            },
        }),
    };
});

function renderWithProviders(ui: React.ReactElement): ReturnType<typeof render> {
    return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>);
}

describe('AdminDashboardLayout', () => {
    it('renders the admin sidebar with the admin navigation', () => {
        renderWithProviders(
            <AdminDashboardLayout breadcrumbs={[{ title: 'Beranda', href: '/admin/dashboard' }]}>
                <div>admin page body</div>
            </AdminDashboardLayout>,
        );

        expect(
            screen.getByTestId('admin-dashboard-layout'),
        ).toBeInTheDocument();
        const sidebar = screen.getByTestId('admin-sidebar');
        expect(sidebar).toBeInTheDocument();
        expect(screen.getByTestId('admin-user-menu')).toBeInTheDocument();
        expect(
            screen.queryByTestId('marketplace-layout-umkm'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('marketplace-layout-creator'),
        ).not.toBeInTheDocument();

        const links = within(sidebar).getAllByRole('link');
        const labels = links.map((link) => link.textContent?.trim());
        expect(labels).toEqual([
            expect.stringContaining('Collabite'),
            'Dashboard',
            'Pengguna',
            'Verifikasi Creator',
            'Campaign',
            'Kolaborasi',
            'Konten',
            'Review',
            'Audit Log',
            'Laporan',
        ]);

        links.forEach((link) => {
            const href = link.getAttribute('href') ?? '';

            if (href === '/' || href.startsWith('http')) {
                return;
            }

            expect(href.startsWith('/admin')).toBe(true);
        });
    });
});
