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
                'rounded-xl border border-border bg-card',
                className,
            )}
        >
            <div className="border-b border-border px-4 py-4 sm:px-5">
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {description ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            <div className="px-4 py-4 sm:px-5">{children}</div>
            {footer ? (
                <div className="border-t border-border px-4 py-4 sm:px-5">
                    {footer}
                </div>
            ) : null}
        </section>
    );
}
