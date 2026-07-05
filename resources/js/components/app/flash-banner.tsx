import type { ReactNode } from 'react';

type FlashBannerProps = {
    message: string;
};

export function FlashBanner({ message }: FlashBannerProps): ReactNode {
    return (
        <div className="border-2 border-[var(--success)] bg-[var(--success-soft)] px-4 py-3 text-sm font-bold text-[var(--success)] shadow-[2px_2px_0_0_var(--neutral-900)]">
            {message}
        </div>
    );
}
