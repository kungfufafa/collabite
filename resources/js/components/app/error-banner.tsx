import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type ErrorBannerProps = {
    message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps): ReactNode {
    return (
        <div
            role="alert"
            className="flex items-start gap-2 border-2 border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-bold text-[var(--danger)] shadow-[2px_2px_0_0_var(--neutral-900)]"
        >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}
