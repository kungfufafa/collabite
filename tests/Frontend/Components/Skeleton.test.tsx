import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
    it('renders a div with the data-slot expected by skeleton layouts', () => {
        render(<Skeleton data-testid="skel" />);
        const skel = screen.getByTestId('skel');

        expect(skel.tagName).toBe('DIV');
        expect(skel.getAttribute('data-slot')).toBe('skeleton');
    });

    it('merges custom className so layout styles apply', () => {
        render(
            <Skeleton
                data-testid="skel"
                className="h-12 w-12 rounded-full"
            />,
        );
        const skel = screen.getByTestId('skel');

        expect(skel).toHaveClass('h-12');
        expect(skel).toHaveClass('w-12');
        expect(skel).toHaveClass('rounded-full');
    });
});