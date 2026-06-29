import type * as Inertia from '@inertiajs/react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';
import PublicLayout from '@/layouts/public-layout';

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual<typeof Inertia>('@inertiajs/react');

    return {
        ...actual,
        usePage: () => ({
            url: '/',
            props: {
                auth: { user: null },
            },
        }),
    };
});

function renderWithProviders(ui: React.ReactElement): ReturnType<typeof render> {
    return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>);
}

describe('PublicLayout', () => {
    it('renders the public marketing shell with auth links when logged out', () => {
        renderWithProviders(
            <PublicLayout>
                <h1>Landing headline</h1>
            </PublicLayout>,
        );

        expect(screen.getByTestId('public-layout')).toBeInTheDocument();
        expect(
            within(screen.getByTestId('public-navbar')).getByTestId(
                'collabite-logo',
            ),
        ).toBeInTheDocument();
        expect(screen.getByTestId('public-footer')).toBeInTheDocument();
        expect(screen.getByTestId('public-main')).toHaveTextContent(
            'Landing headline',
        );
        expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute(
            'href',
            '/login',
        );
        expect(
            screen.getByRole('link', { name: 'Daftar Gratis' }),
        ).toHaveAttribute('href', '/register');
    });

    it('hides the footer when hideFooter is true', () => {
        renderWithProviders(
            <PublicLayout hideFooter>
                <span>privacy</span>
            </PublicLayout>,
        );

        expect(screen.queryByTestId('public-footer')).not.toBeInTheDocument();
    });
});
