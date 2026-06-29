import type { ReactNode } from 'react';

type ActivityTimelineItem = {
    title: string;
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
        <ol className="flex flex-col">
            {items.map((item, index) => (
                <li className="flex gap-3 pb-4 last:pb-0" key={`${item.title}-${index}`}>
                    <div className="flex flex-col items-center">
                        <span className="mt-1 size-2 rounded-full bg-[var(--brand-secondary)]" />
                        {index < items.length - 1 ? (
                            <span className="my-1 w-px flex-1 bg-border" />
                        ) : null}
                    </div>
                    <div className="-mt-0.5">
                        <p className="text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
