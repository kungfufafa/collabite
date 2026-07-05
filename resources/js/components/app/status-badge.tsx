import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type StatusTone =
    | 'neutral'
    | 'info'
    | 'warning'
    | 'success'
    | 'danger'
    | 'brand';

const TONES: Record<StatusTone, string> = {
    neutral:
        'bg-[var(--neutral-100)] text-[var(--neutral-700)]',
    info: 'bg-[var(--info-soft)] text-[var(--info)]',
    warning:
        'bg-[var(--warning-soft)] text-[var(--warning)]',
    success:
        'bg-[var(--success-soft)] text-[var(--success)]',
    danger:
        'bg-[var(--danger-soft)] text-[var(--danger)]',
    brand:
        'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
};

type StatusBadgeProps = {
    tone?: StatusTone;
    label: string;
    icon?: LucideIcon;
    className?: string;
};

export function StatusBadge({
    tone = 'neutral',
    label,
    icon: Icon,
    className = '',
}: StatusBadgeProps): ReactNode {
    return (
        <span
            className={`inline-flex w-fit items-center gap-1.5 border-2 border-[var(--neutral-900)] px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0_0_var(--neutral-900)] ${TONES[tone]} ${className}`}
        >
            {Icon ? <Icon className="size-3.5" /> : null}
            {label}
        </span>
    );
}
