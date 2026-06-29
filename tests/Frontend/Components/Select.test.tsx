import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

describe('Select', () => {
    it('opens the listbox when the trigger is clicked', async () => {
        const user = userEvent.setup();
        render(
            <Select>
                <SelectTrigger aria-label="Status">
                    <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                </SelectContent>
            </Select>,
        );

        const trigger = screen.getByRole('combobox', { name: 'Status' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        await user.click(trigger);

        await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
        });
        expect(
            await screen.findByRole('option', { name: 'Published' }),
        ).toBeInTheDocument();
    });

    it('updates the displayed value when an item is selected', async () => {
        const user = userEvent.setup();
        render(
            <Select>
                <SelectTrigger aria-label="Status">
                    <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                </SelectContent>
            </Select>,
        );

        const trigger = screen.getByRole('combobox', { name: 'Status' });
        await user.click(trigger);

        await waitFor(() => {
            expect(trigger).toHaveAttribute('aria-expanded', 'true');
        });

        await user.click(
            await screen.findByRole('option', { name: 'Published' }),
        );

        await waitFor(() => {
            expect(trigger).toHaveTextContent('Published');
        });
    });
});