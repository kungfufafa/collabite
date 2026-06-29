import type { ReactNode } from 'react';
import { FileTextIcon, RocketIcon, UserPlusIcon } from 'lucide-react';

import { DashboardCard } from '@/components/dashboard-card';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import type { DashboardActivityItem } from '@/components/dashboard/types';

type DashboardActivityFeedProps = {
    title?: string;
    description?: string;
    items: DashboardActivityItem[];
    className?: string;
};

function ActivityIcon({ index }: { index: number }): ReactNode {
    const icons = [
        <UserPlusIcon key="user" />,
        <FileTextIcon key="file" />,
        <RocketIcon key="rocket" />,
    ];

    return icons[index % icons.length];
}

export function DashboardActivityFeed({
    title = 'Aktivitas',
    description = 'Pembaruan terbaru di workspace kamu.',
    items,
    className,
}: DashboardActivityFeedProps): ReactNode {
    return (
        <DashboardCard className={className ?? 'gap-0'}>
            <CardHeader className="border-b">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                {items.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-muted-foreground">
                        Belum ada aktivitas terbaru.
                    </p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border">
                        {items.map((item, index) => (
                            <li
                                className="flex h-16 items-center gap-3 px-6"
                                key={`${item.title}-${index}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className="flex size-10 shrink-0 items-center justify-center [&_svg]:size-4"
                                >
                                    <ActivityIcon index={index} />
                                </span>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className="line-clamp-1 text-pretty text-sm leading-snug text-foreground">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.time}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </DashboardCard>
    );
}
