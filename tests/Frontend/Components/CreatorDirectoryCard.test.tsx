import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CreatorDirectoryCard } from '@/components/collabite/public/creator-directory-card';

vi.mock('@/routes/public/creators', () => ({
    show: (id: number) => `/creators/${id}`,
}));

vi.mock('@inertiajs/react', () => ({
    Link: ({
        children,
        href,
        ...props
    }: {
        children: React.ReactNode;
        href: string;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('CreatorDirectoryCard', () => {
    it('renders creator details with profile link', () => {
        render(
            <CreatorDirectoryCard
                creator={{
                    id: 7,
                    name: 'Anisa Putri',
                    headline: 'Beauty & Lifestyle Creator',
                    city: 'Bandung',
                    rating_avg: 4.8,
                    rating_count: 12,
                    verification_status: 'verified',
                    profile_photo_url: null,
                    categories: ['Kecantikan', 'Lifestyle'],
                    portfolio_count: 3,
                    portfolio_urls: [
                        '/storage/demo/portfolio-1.png',
                        '/storage/demo/portfolio-2.png',
                    ],
                }}
            />,
        );

        expect(screen.getByText('Anisa Putri')).toBeInTheDocument();
        expect(screen.getByText('Terverifikasi')).toBeInTheDocument();
        expect(screen.getByText('Kecantikan')).toBeInTheDocument();
        const profileLink = screen.getByRole('link', { name: 'Lihat Profil' });
        expect(profileLink).toHaveAttribute('href', '/creators/7');
    });
});
