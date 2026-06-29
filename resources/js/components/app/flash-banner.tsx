import type { ReactNode } from 'react';

type FlashBannerProps = {
    message: string;
};

export function FlashBanner({ message }: FlashBannerProps): ReactNode {
    return (
        <div className="rounded-md border border-[var(--success-border)] bg-[var(--success-soft)] px-4 py-3 text-sm text-[var(--success)]">
            {message}
        </div>
    );
}
