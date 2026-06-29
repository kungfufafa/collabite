import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input', () => {
    it('renders with provided placeholder', () => {
        render(<Input placeholder="Email" />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    it('accepts typed characters via user-event', async () => {
        render(<Input placeholder="Email" />);
        const input = screen.getByPlaceholderText<HTMLInputElement>('Email');

        await userEvent.type(input, 'sari@umkm.test');

        expect(input.value).toBe('sari@umkm.test');
    });

    it('respects the disabled attribute', async () => {
        const onChange = vi.fn();

        render(<Input placeholder="Email" disabled onChange={onChange} />);
        const input = screen.getByPlaceholderText<HTMLInputElement>('Email');

        expect(input).toBeDisabled();
        await userEvent.type(input, 'foo');
        expect(onChange).not.toHaveBeenCalled();
    });
});
