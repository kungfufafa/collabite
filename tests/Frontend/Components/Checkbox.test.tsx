import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
    it('toggles the checked state on click', async () => {
        const onCheckedChange = vi.fn();
        render(<Checkbox aria-label="Setuju" onCheckedChange={onCheckedChange} />);
        const box = screen.getByRole('checkbox', { name: 'Setuju' });

        expect(box).not.toBeChecked();

        await userEvent.click(box);

        expect(box).toBeChecked();
        expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('does not change state when disabled', async () => {
        const onCheckedChange = vi.fn();
        render(
            <Checkbox
                aria-label="Setuju"
                disabled
                onCheckedChange={onCheckedChange}
            />,
        );
        const box = screen.getByRole('checkbox', { name: 'Setuju' });

        expect(box).toBeDisabled();
        await userEvent.click(box);

        expect(box).not.toBeChecked();
        expect(onCheckedChange).not.toHaveBeenCalled();
    });
});