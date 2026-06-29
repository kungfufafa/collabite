import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/badge';

describe('Badge (status)', () => {
    it('renders text in the default variant', () => {
        render(<Badge>Open</Badge>);
        expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('exposes the data-slot Radix attribute for downstream styling', () => {
        render(<Badge variant="secondary">In Collaboration</Badge>);
        const badge = screen.getByText('In Collaboration');
        expect(badge.getAttribute('data-slot')).toBe('badge');
    });
});
