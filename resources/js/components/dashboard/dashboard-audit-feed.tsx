import type { ReactNode } from 'react';

import { DashboardCard } from '@/components/dashboard-card';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

import type { DashboardActivityLogItem } from '@/components/dashboard/types';

type DashboardAuditFeedProps = {
    items: DashboardActivityLogItem[];
    viewAllHref?: string;
    className?: string;
};

export function DashboardAuditFeed({
    items,
    viewAllHref = '/admin/audit-logs',
    className,
}: DashboardAuditFeedProps): ReactNode {
    return (
        <DashboardCard className={className ?? 'gap-0 md:col-span-2 lg:col-span-4'}>
            <CardHeader className="border-b">
                <CardTitle className="text-base">Aktivitas terbaru</CardTitle>
                <CardDescription>
                    Catatan append-only dari sistem.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-4">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Belum ada aktivitas tercatat.
                    </p>
                ) : (
                    <ul className="divide-y text-sm">
                        {items.map((item) => (
                            <li
                                className="flex items-center justify-between gap-3 py-2"
                                key={item.id}
                            >
                                <span>
                                    <span className="font-medium">
                                        {item.actor ?? 'Sistem'}
                                    </span>{' '}
                                    <span className="text-muted-foreground">
                                        {item.action}
                                    </span>
                                    {item.subject ? (
                                        <span className="text-foreground">
                                            {' '}
                                            — {item.subject}
                                        </span>
                                    ) : null}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {item.created_at}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <Separator className="my-3" />
                <Button asChild variant="ghost" size="sm">
                    <Link href={viewAllHref} prefetch>
                        Lihat audit log
                    </Link>
                </Button>
            </CardContent>
        </DashboardCard>
    );
}
