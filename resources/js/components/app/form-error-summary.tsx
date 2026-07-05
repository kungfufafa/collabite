import { AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { flattenValidationErrors } from '@/lib/form-errors';
import type { ValidationErrors } from '@/lib/form-errors';
import { cn } from '@/lib/utils';

type FormErrorSummaryProps = {
    errors: ValidationErrors;
    title?: string;
    className?: string;
};

export function FormErrorSummary({
    errors,
    title = 'Periksa isian berikut',
    className,
}: FormErrorSummaryProps): ReactNode {
    const summaryRef = useRef<HTMLDivElement>(null);
    const messages = flattenValidationErrors(errors);
    const messageKey = messages.join('|');
    const messageCount = messages.length;

    useEffect(() => {
        if (messageCount === 0 || !summaryRef.current) {
            return;
        }

        summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messageCount, messageKey]);

    if (messages.length === 0) {
        return null;
    }

    return (
        <div
            ref={summaryRef}
            role="alert"
            aria-live="polite"
            className={cn(
                'border-2 border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)] shadow-[3px_3px_0_0_var(--neutral-900)]',
                className,
            )}
        >
            <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                    <p className="font-black uppercase tracking-wide">{title}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 font-semibold">
                        {messages.map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
