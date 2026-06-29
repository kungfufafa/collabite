import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

describe('Tooltip', () => {
    it('shows the tooltip content on hover', async () => {
        const user = userEvent.setup();
        render(
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="button">Simpan</button>
                    </TooltipTrigger>
                    <TooltipContent>Tekan untuk menyimpan</TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        );

        expect(
            screen.queryByText('Tekan untuk menyimpan'),
        ).not.toBeInTheDocument();

        await user.hover(screen.getByRole('button', { name: 'Simpan' }));

        const matches = await screen.findAllByText('Tekan untuk menyimpan');
        expect(matches.length).toBeGreaterThan(0);
    });

    it('shows the tooltip on keyboard focus', async () => {
        const user = userEvent.setup();
        render(
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="button">Salin</button>
                    </TooltipTrigger>
                    <TooltipContent>Salin ke papan klip</TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        );

        await user.tab();

        const matches = await screen.findAllByText('Salin ke papan klip');
        expect(matches.length).toBeGreaterThan(0);
    });
});