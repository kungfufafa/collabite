import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

describe('Avatar', () => {
    it('falls back to AvatarFallback when no src is provided', async () => {
        render(
            <Avatar>
                <AvatarImage src="" alt="Pengguna" />
                <AvatarFallback>SR</AvatarFallback>
            </Avatar>,
        );

        const fallback = await screen.findByText('SR');
        expect(fallback).toBeInTheDocument();
        expect(fallback.getAttribute('data-slot')).toBe('avatar-fallback');
    });

    it('renders the fallback initials when the image src fails to load', async () => {
        render(
            <Avatar>
                <AvatarImage src="https://example.invalid/missing.png" alt="Pengguna" />
                <AvatarFallback>AP</AvatarFallback>
            </Avatar>,
        );

        await waitFor(() => {
            expect(screen.getByText('AP')).toBeInTheDocument();
        });
    });
});