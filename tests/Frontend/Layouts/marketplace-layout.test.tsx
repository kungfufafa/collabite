import type { InertiaLinkProps } from '@inertiajs/react';
import type * as Inertia from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MarketplaceLayout from '@/layouts/marketplace-layout';

const defaultPage = {
    url: '/umkm/dashboard',
    props: {
        auth: {
            user: {
                id: 1,
                name: 'Sari Pemilik',
                email: 'sari@umkm.id',
                avatar: null,
            },
        },
    },
};

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual<typeof Inertia>('@inertiajs/react');

    return {
        ...actual,
        usePage: vi.fn(() => defaultPage),
    };
});

function renderLayout(ui: React.ReactElement): ReturnType<typeof render> {
    return render(ui);
}

describe('MarketplaceLayout', () => {
    beforeEach(async () => {
        vi.mocked(usePage).mockReturnValue(defaultPage as ReturnType<typeof usePage>);
    });

    it('renders the UMKM shell with grouped sidebar navigation', () => {
        const { container } = renderLayout(
            <MarketplaceLayout role="umkm" showSearch>
                <div data-test="marketplace-children">Hello child</div>
            </MarketplaceLayout>,
        );

        expect(screen.getByTestId('app-shell-umkm')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-sidebar')).not.toBeInTheDocument();

        const sidebar = screen.getByTestId('app-shell-sidebar');
        const labels = within(sidebar)
            .getAllByRole('link')
            .map((link) => link.textContent?.trim())
            .filter((label) => label !== 'Collabite');
        expect(labels).toEqual([
            'Dashboard',
            'Campaign',
            'Cari Creator',
            'Kolaborasi',
            'Profil Bisnis',
            'Pengaturan',
        ]);

        expect(screen.getByTestId('app-shell-search')).toBeInTheDocument();
        expect(screen.getByTestId('app-shell-user-menu')).toBeInTheDocument();
        expect(screen.getByTestId('app-shell-main')).toHaveTextContent(
            'Hello child',
        );
        expect(
            container.querySelector('[data-slot="sidebar-wrapper"]'),
        ).toBeInTheDocument();
    });

    it('renders the Creator shell and highlights the active dashboard link', () => {
        vi.mocked(usePage).mockReturnValue({
            url: '/creator/dashboard',
            props: {
                auth: {
                    user: {
                        id: 1,
                        name: 'Nadia',
                        email: 'nadia@creator.id',
                        avatar: null,
                    },
                },
            },
        } as ReturnType<typeof usePage>);

        renderLayout(
            <MarketplaceLayout role="creator">
                <span>creator child</span>
            </MarketplaceLayout>,
        );

        const sidebar = screen.getByTestId('app-shell-sidebar');
        const dashboard = within(sidebar).getByRole('link', { name: 'Dashboard' });
        expect(dashboard).toHaveAttribute('data-active', 'true');
    });

    it('exposes a mobile menu trigger that opens the sheet', async () => {
        const user = userEvent.setup();
        renderLayout(
            <MarketplaceLayout role="umkm">
                <span>content</span>
            </MarketplaceLayout>,
        );

        await user.click(screen.getByTestId('app-shell-mobile-menu-trigger'));
        const sheet = await screen.findByRole('dialog');
        expect(sheet).toBeInTheDocument();
        expect(sheet).toHaveAttribute('data-mobile', 'true');
    });
});
