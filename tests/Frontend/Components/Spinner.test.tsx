import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from '@/components/ui/spinner';

describe('Spinner', () => {
    it('exposes role=status and an aria-label for screen readers', () => {
        render(<Spinner data-testid="spin" />);

        const spinner = screen.getByTestId('spin');
        expect(spinner).toHaveAttribute('role', 'status');
        expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('respects a custom aria-label override', () => {
        render(<Spinner aria-label="Memuat dasbor" data-testid="spin" />);
        expect(screen.getByTestId('spin')).toHaveAttribute(
            'aria-label',
            'Memuat dasbor',
        );
    });
});