import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toaster } from '@/components/ui/sonner';

describe('Sonner Toaster', () => {
    it('mounts a region (section) that is ready to host notifications', () => {
        const { container } = render(<Toaster />);

        const region = screen.getByRole('region', { hidden: true });
        expect(region).toBeInTheDocument();
        expect(region.tagName).toBe('SECTION');

        // The Toaster wrapper itself is rendered (even without active toasts).
        expect(container.firstChild).not.toBeNull();
    });

    it('survives an empty render with no thrown errors', () => {
        expect(() => render(<Toaster />)).not.toThrow();
    });
});