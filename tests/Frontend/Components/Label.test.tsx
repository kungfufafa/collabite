import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

describe('Label', () => {
    it('associates with an input via htmlFor so clicking the label focuses the field', async () => {
        const onFocus = vi.fn();
        render(
            <>
                <Label htmlFor="email-input">Email UMKM</Label>
                <Input
                    id="email-input"
                    placeholder="nama@umkm.test"
                    onFocus={onFocus}
                />
            </>,
        );

        const label = screen.getByText('Email UMKM');
        expect(label.tagName).toBe('LABEL');
        expect(label).toHaveAttribute('for', 'email-input');

        await userEvent.click(label);

        const input = screen.getByPlaceholderText<HTMLInputElement>(
            'nama@umkm.test',
        );
        expect(input).toHaveFocus();
        expect(onFocus).toHaveBeenCalled();
    });

    it('exposes the data-slot used by surrounding form layouts', () => {
        render(<Label htmlFor="x">Nama</Label>);
        expect(screen.getByText('Nama').getAttribute('data-slot')).toBe('label');
    });
});