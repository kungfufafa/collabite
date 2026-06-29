import { Link } from '@inertiajs/react';
import { ArrowRightIcon, CircleCheckIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { DashboardCard } from '@/components/dashboard-card';
import { Button } from '@/components/ui/button';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Progress } from '@/components/ui/progress-placeholder';

import type { DashboardHealth } from '@/components/dashboard/types';

type DashboardHealthPanelProps = {
    title: string;
    health: DashboardHealth;
    actionHref?: string;
    actionLabel?: string;
    showProgress?: boolean;
    className?: string;
};

export function DashboardHealthPanel({
    title,
    health,
    actionHref,
    actionLabel = 'Lihat detail',
    showProgress = false,
    className,
}: DashboardHealthPanelProps): ReactNode {
    return (
        <DashboardCard className={className ?? 'gap-0'}>
            <CardHeader className="border-b">
                <CardTitle className="text-balance text-base">{title}</CardTitle>
                <CardDescription className="text-pretty">
                    {health.message}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full items-center px-0">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <CircleCheckIcon aria-hidden="true" />
                        </EmptyMedia>
                        <EmptyTitle>
                            {health.caught_up ? 'Semua terkendali.' : 'Perlu perhatian.'}
                        </EmptyTitle>
                        <EmptyDescription className="text-xs">
                            {health.message}
                        </EmptyDescription>
                    </EmptyHeader>
                    {showProgress && typeof health.percent === 'number' ? (
                        <div className="px-6 pb-2">
                            <Progress value={health.percent} className="h-2" />
                            <p className="mt-2 text-center text-xs text-muted-foreground">
                                {health.percent}% lengkap
                            </p>
                        </div>
                    ) : null}
                    {actionHref ? (
                        <EmptyContent>
                            <Button asChild variant="ghost">
                                <Link href={actionHref} prefetch>
                                    {actionLabel}
                                    <ArrowRightIcon aria-hidden="true" />
                                </Link>
                            </Button>
                        </EmptyContent>
                    ) : null}
                </Empty>
            </CardContent>
        </DashboardCard>
    );
}
