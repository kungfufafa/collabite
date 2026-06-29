import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
    it('renders its children', () => {
        render(<Button>Save</Button>);
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('invokes onClick once when clicked', async () => {
        const onClick = vi.fn();

        render(<Button onClick={onClick}>Submit</Button>);
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('respects disabled and does not fire onClick', async () => {
        const onClick = vi.fn();

        render(
            <Button onClick={onClick} disabled>
                Send
            </Button>,
        );
        const btn = screen.getByRole('button', { name: 'Send' });

        expect(btn).toBeDisabled();
        await userEvent.click(btn);
        expect(onClick).not.toHaveBeenCalled();
    });
});
