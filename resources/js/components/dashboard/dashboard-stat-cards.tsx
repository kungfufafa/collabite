import type { ReactNode } from 'react';

import { Delta, DeltaIcon, DeltaValue } from '@/components/delta';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import type { DashboardStat } from '@/components/dashboard/types';

type DashboardStatCardsProps = {
    stats: DashboardStat[];
};

export function DashboardStatCards({ stats }: DashboardStatCardsProps): ReactNode {
    return (
        <>
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardHeader>
                        <CardTitle className="text-xs font-normal text-muted-foreground">
                            {stat.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold tracking-tight text-balance tabular-nums">
                            {stat.value}
                        </p>
                    </CardContent>
                    {typeof stat.delta === 'number' ? (
                        <CardFooter className="gap-1.5 text-xs">
                            <Delta value={stat.delta}>
                                <DeltaIcon />
                                <DeltaValue />
                            </Delta>
                            <span className="text-pretty text-muted-foreground">
                                vs minggu lalu
                            </span>
                        </CardFooter>
                    ) : null}
                </Card>
            ))}
        </>
    );
}
