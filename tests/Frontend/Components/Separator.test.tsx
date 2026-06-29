import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from '@/components/ui/separator';

describe('Separator', () => {
    it('respects the vertical orientation via the data attribute', () => {
        render(<Separator orientation="vertical" data-testid="sep" />);
        const sep = screen.getByTestId('sep');

        expect(sep.getAttribute('data-orientation')).toBe('vertical');
    });

    it('defaults to horizontal orientation when none is provided', () => {
        render(<Separator data-testid="sep" />);
        const sep = screen.getByTestId('sep');

        expect(sep.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('exposes role=separator when decorative is false', () => {
        render(<Separator decorative={false} data-testid="sep" />);
        const sep = screen.getByTestId('sep');

        expect(sep).toHaveAttribute('role', 'separator');
    });
});