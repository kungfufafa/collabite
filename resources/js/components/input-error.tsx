import { AlertCircle } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { formatFieldError, type ValidationErrorValue } from '@/lib/form-errors';
import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: ValidationErrorValue }) {
    const formattedMessage = formatFieldError(message);

    if (!formattedMessage) {
        return null;
    }

    return (
        <p
            {...props}
            role="alert"
            className={cn(
                'mt-1.5 flex items-start gap-2 border-2 border-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)] shadow-[2px_2px_0_0_var(--neutral-900)]',
                className,
            )}
        >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{formattedMessage}</span>
        </p>
    );
}
