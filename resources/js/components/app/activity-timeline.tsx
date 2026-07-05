import type { ReactNode } from 'react';

type ActivityTimelineItem = {
    title: string;
    subtitle?: string;
    time: string;
};

type ActivityTimelineProps = {
    items: ActivityTimelineItem[];
};

export function ActivityTimeline({ items }: ActivityTimelineProps): ReactNode {
    if (items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Belum ada aktivitas tercatat.
            </p>
        );
    }

    return (
        <ol className="flex max-h-[32rem] flex-col gap-5 overflow-y-auto pr-1">
            {items.map((item, index) => (
                <li className="flex gap-4" key={`${item.title}-${index}`}>
                    <div className="flex flex-col items-center pt-1.5">
                        <span className="size-3 shrink-0 border-2 border-[var(--neutral-900)] bg-[var(--brand-secondary)] shadow-[1px_1px_0_0_var(--neutral-900)]" />
                        {index < items.length - 1 ? (
                            <span className="mt-2 w-[2px] flex-1 bg-[var(--neutral-900)]" />
                        ) : null}
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                        <p className="text-sm font-bold leading-relaxed text-foreground">
                            {item.title}
                        </p>
                        {item.subtitle ? (
                            <p className="mt-1 break-all font-mono text-xs leading-relaxed text-muted-foreground">
                                {item.subtitle}
                            </p>
                        ) : null}
                        <p className="mt-2 text-xs text-muted-foreground">
                            {item.time}
                        </p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
