import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TextLink from '@/components/text-link';

describe('TextLink', () => {
    it('renders an anchor with the given href and accessible name', () => {
        render(
            <TextLink href="/forgot-password">Lupa kata sandi?</TextLink>,
        );

        const link = screen.getByRole('link', { name: 'Lupa kata sandi?' });
        expect(link).toHaveAttribute('href', '/forgot-password');
    });

    it('invokes a custom onClick without navigating the Inertia router', async () => {
        const onClick = vi.fn((event: React.MouseEvent) => {
            event.preventDefault();
        });
        render(
            <TextLink href="/help" onClick={onClick}>
                Pusat bantuan
            </TextLink>,
        );

        await userEvent.click(
            screen.getByRole('link', { name: 'Pusat bantuan' }),
        );

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});