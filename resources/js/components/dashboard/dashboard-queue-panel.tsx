import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DashboardCard } from '@/components/dashboard-card';

import type { DashboardQueueItem } from '@/components/dashboard/types';

type DashboardQueuePanelProps = {
    title: string;
    description: string;
    items: DashboardQueueItem[];
    viewAllHref: string;
    className?: string;
};

export function DashboardQueuePanel({
    title,
    description,
    items,
    viewAllHref,
    className,
}: DashboardQueuePanelProps): ReactNode {
    return (
        <DashboardCard className={className ?? 'gap-0'}>
            <CardHeader className="border-b">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-4">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Tidak ada item menunggu.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2 text-sm">
                        {items.map((item) => (
                            <li
                                className="flex items-center justify-between gap-2"
                                key={item.id}
                            >
                                <span className="truncate">
                                    {item.title}{' '}
                                    <span className="text-xs text-muted-foreground">
                                        {item.meta}
                                    </span>
                                </span>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={item.href} prefetch>
                                        {item.cta}
                                    </Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={viewAllHref} prefetch>
                            Lihat semua
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </DashboardCard>
    );
}
