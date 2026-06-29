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
        'bg-[var(--neutral-100)] text-[var(--neutral-700)] ring-[var(--neutral-200)]',
    info: 'bg-[var(--info-soft)] text-[var(--info)] ring-[var(--info-border)]',
    warning:
        'bg-[var(--warning-soft)] text-[var(--warning)] ring-[var(--warning-border)]',
    success:
        'bg-[var(--success-soft)] text-[var(--success)] ring-[var(--success-border)]',
    danger:
        'bg-[var(--danger-soft)] text-[var(--danger)] ring-[var(--danger-border)]',
    brand:
        'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] ring-[var(--brand-primary-muted)]',
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
            className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
        >
            {Icon ? <Icon className="size-3.5" /> : null}
            {label}
        </span>
    );
}
