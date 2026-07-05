import { Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NoticeTone = 'info' | 'warning' | 'success' | 'danger';

const TONE_STYLES: Record<NoticeTone, string> = {
    info: 'border-[var(--info)] bg-[var(--info-soft)] text-[var(--info)]',
    warning: 'border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning)]',
    success: 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]',
    danger: 'border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]',
};

const TONE_ICONS: Record<NoticeTone, LucideIcon> = {
    info: Info,
    warning: TriangleAlert,
    success: CheckCircle2,
    danger: AlertCircle,
};

type NoticeBannerProps = {
    tone?: NoticeTone;
    title?: string;
    message: string;
    action?: {
        label: string;
        href: string;
    };
    className?: string;
};

export function NoticeBanner({
    tone = 'info',
    title,
    message,
    action,
    className,
}: NoticeBannerProps): ReactNode {
    const Icon = TONE_ICONS[tone];

    return (
        <div
            role="status"
            className={cn(
                'border-2 px-4 py-3 text-sm shadow-[2px_2px_0_0_var(--neutral-900)]',
                TONE_STYLES[tone],
                className,
            )}
        >
            <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                    {title ? (
                        <p className="font-black uppercase tracking-wide">{title}</p>
                    ) : null}
                    <p className={cn('font-semibold leading-relaxed', title ? 'mt-1' : undefined)}>
                        {message}
                    </p>
                    {action ? (
                        <Button asChild className="mt-3" size="sm" variant="outline">
                            <Link href={action.href}>{action.label}</Link>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
