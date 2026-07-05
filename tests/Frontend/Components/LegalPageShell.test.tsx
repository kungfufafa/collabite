import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LegalPageShell } from '@/components/collabite/public/legal-page-shell';
import { privacyPolicyDocument } from '@/content/legal/privacy-policy';

vi.mock('@inertiajs/react', async () => {
    const actual = await vi.importActual<typeof import('@inertiajs/react')>(
        '@inertiajs/react',
    );

    return {
        ...actual,
        Link: ({
            href,
            children,
            ...props
        }: {
            href: string;
            children: React.ReactNode;
        }) => (
            <a href={href} {...props}>
                {children}
            </a>
        ),
    };
});

describe('LegalPageShell', () => {
    it('renders legal document sections and navigation links', () => {
        render(
            <LegalPageShell
                document={privacyPolicyDocument}
                relatedLink={{
                    label: 'Syarat dan Ketentuan',
                    href: '/syarat-dan-ketentuan',
                }}
            />,
        );

        expect(screen.getByTestId('legal-page')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Kebijakan Privasi' })).toBeInTheDocument();
        expect(screen.getByText(/Terakhir diperbarui:/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '1. Pendahuluan' })).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Syarat dan Ketentuan' }),
        ).toHaveAttribute('href', '/syarat-dan-ketentuan');
    });
});
