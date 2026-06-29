import type * as Inertia from '@inertiajs/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';
import CollaborationWorkspaceLayout from '@/layouts/collaboration-workspace-layout';

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual<typeof Inertia>('@inertiajs/react');

    return {
        ...actual,
        usePage: () => ({
            url: '/umkm/collaborations/42',
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
        }),
    };
});

function renderWithProviders(ui: React.ReactElement): ReturnType<typeof render> {
    return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>);
}

describe('CollaborationWorkspaceLayout', () => {
    it('renders workspace context and tabs without admin sidebar', () => {
        renderWithProviders(
            <CollaborationWorkspaceLayout
                context={{
                    id: 42,
                    title: 'Promosi Produk Baru',
                    subtitle: 'UMKM: Toko Sari',
                    statusLabel: 'Aktif',
                    counterpartyLabel: 'Creator',
                    counterpartyValue: 'Budi',
                    backHref: '/umkm/collaborations',
                    backLabel: 'Daftar Kolaborasi',
                }}
                tabs={[
                    { value: 'overview', label: 'Ringkasan' },
                    { value: 'messages', label: 'Pesan', count: 3 },
                    { value: 'progress', label: 'Progres' },
                ]}
            >
                <div>workspace body</div>
            </CollaborationWorkspaceLayout>,
        );

        expect(
            screen.getByTestId('collaboration-workspace-layout'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('admin-sidebar'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('marketplace-layout-umkm'),
        ).not.toBeInTheDocument();

        expect(screen.getByTestId('collaboration-back')).toHaveAttribute(
            'href',
            '/umkm/collaborations',
        );
        const tabs = screen.getByTestId('collaboration-tabs');
        expect(within(tabs).getByText('Pesan')).toBeInTheDocument();
        expect(within(tabs).getByText('3')).toBeInTheDocument();

        expect(screen.getByTestId('collaboration-content')).toHaveTextContent(
            'workspace body',
        );
    });

    it('invokes onTabChange when tabs are rendered as buttons', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        renderWithProviders(
            <CollaborationWorkspaceLayout
                context={{
                    id: 1,
                    title: 'Workspace',
                    backHref: '/creator/collaborations',
                }}
                tabs={[
                    { value: 'overview', label: 'Ringkasan' },
                    { value: 'messages', label: 'Pesan' },
                ]}
                activeTab="overview"
                onTabChange={onChange}
            >
                <span>body</span>
            </CollaborationWorkspaceLayout>,
        );

        await user.click(screen.getByTestId('collaboration-tab-messages'));
        expect(onChange).toHaveBeenCalledWith('messages');
    });
});
