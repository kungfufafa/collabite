import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

describe('DropdownMenu', () => {
    it('opens on trigger click and exposes items', async () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Aksi</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Hapus</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Aksi' }));

        expect(await screen.findByRole('menu')).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'Hapus' }),
        ).toBeInTheDocument();
    });

    it('invokes onSelect when an item is clicked', async () => {
        const onSelect = vi.fn();
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Aksi</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={onSelect}>
                        Arsipkan
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Aksi' }));
        await userEvent.click(
            await screen.findByRole('menuitem', { name: 'Arsipkan' }),
        );

        expect(onSelect).toHaveBeenCalledTimes(1);
    });
});