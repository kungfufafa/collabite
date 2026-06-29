import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InputError from '@/components/input-error';

describe('InputError', () => {
    it('renders the message when one is provided', () => {
        render(<InputError message="Wajib diisi" />);
        expect(screen.getByText('Wajib diisi')).toBeInTheDocument();
    });

    it('renders nothing when no message is provided', () => {
        const { container } = render(<InputError />);
        expect(container.firstChild).toBeNull();
    });
});
