import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea (revision note / force-close reason)', () => {
    it('captures multi-line input', async () => {
        render(<Textarea placeholder="Alasan" />);
        const ta = screen.getByPlaceholderText<HTMLTextAreaElement>('Alasan');

        await userEvent.type(ta, 'Baris 1{enter}Baris 2');
        expect(ta.value).toBe('Baris 1\nBaris 2');
    });

    it('fires change handler with the typed value', async () => {
        const handler = vi.fn();
        render(<Textarea placeholder="Alasan" onChange={handler} />);
        const ta = screen.getByPlaceholderText('Alasan');

        await userEvent.type(ta, 'abc');
        expect(handler).toHaveBeenCalled();
    });
});
