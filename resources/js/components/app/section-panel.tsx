import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type SectionPanelProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    footer?: ReactNode;
};

export function SectionPanel({
    title,
    description,
    children,
    className,
    footer,
}: SectionPanelProps): ReactNode {
    return (
        <section
            className={cn(
                'brutal-surface border-2 border-[var(--neutral-900)] bg-card shadow-[3px_3px_0_0_var(--neutral-900)]',
                className,
            )}
        >
            <div className="border-b-2 border-[var(--neutral-900)] px-4 py-4 sm:px-5">
                <h2 className="text-sm font-black uppercase tracking-wide text-foreground">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            <div className="px-4 py-4 sm:px-5">{children}</div>
            {footer ? (
                <div className="border-t-2 border-[var(--neutral-900)] px-4 py-4 sm:px-5">
                    {footer}
                </div>
            ) : null}
        </section>
    );
}
