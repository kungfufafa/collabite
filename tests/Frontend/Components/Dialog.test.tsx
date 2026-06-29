import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

describe('Dialog', () => {
    it('opens via trigger click and renders content', async () => {
        render(
            <Dialog>
                <DialogTrigger>Buka</DialogTrigger>
                <DialogContent>
                    <DialogTitle>Konfirmasi</DialogTitle>
                    <DialogDescription>Yakin ingin menutup?</DialogDescription>
                </DialogContent>
            </Dialog>,
        );

        expect(
            screen.queryByText('Konfirmasi'),
        ).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Buka' }));

        const title = await screen.findByText('Konfirmasi');
        expect(title).toBeInTheDocument();
        expect(screen.getByText('Yakin ingin menutup?')).toBeInTheDocument();
    });

    it('closes via DialogClose', async () => {
        render(
            <Dialog>
                <DialogTrigger>Buka</DialogTrigger>
                <DialogContent>
                    <DialogTitle>Konfirmasi</DialogTitle>
                    <DialogClose>Tutup sekarang</DialogClose>
                </DialogContent>
            </Dialog>,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Buka' }));
        expect(await screen.findByText('Konfirmasi')).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', { name: 'Tutup sekarang' }),
        );

        expect(screen.queryByText('Konfirmasi')).not.toBeInTheDocument();
    });
});