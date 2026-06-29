import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import PasswordInput from '@/components/password-input';

describe('PasswordInput', () => {
    it('starts as type=password and toggles to text on reveal click', async () => {
        render(<PasswordInput placeholder="Kata sandi" />);
        const input = screen.getByPlaceholderText<HTMLInputElement>('Kata sandi');
        expect(input.type).toBe('password');

        await userEvent.click(screen.getByRole('button', { name: 'Show password' }));

        expect(input.type).toBe('text');
        expect(
            screen.getByRole('button', { name: 'Hide password' }),
        ).toBeInTheDocument();
    });

    it('forwards autoComplete and keeps its value across toggle', async () => {
        render(
            <PasswordInput
                placeholder="Kata sandi"
                autoComplete="current-password"
            />,
        );
        const input = screen.getByPlaceholderText<HTMLInputElement>('Kata sandi');

        expect(input.getAttribute('autocomplete')).toBe('current-password');

        await userEvent.type(input, 'rahasia123');
        expect(input.value).toBe('rahasia123');

        await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
        expect(input.type).toBe('text');
        expect(input.value).toBe('rahasia123');
    });
});