'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { DashboardCard } from '@/components/dashboard-card';
import { Delta, DeltaIcon, DeltaValue } from '@/components/delta';
import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

import type { DashboardDualPoint } from '@/components/dashboard/types';

type DashboardLineChartPanelProps = {
    title: string;
    description: string;
    data: DashboardDualPoint[];
    series: Array<{ key: string; label: string; color: string }>;
    className?: string;
};

function growthPct(
    data: DashboardDualPoint[],
    firstKey: string,
    secondKey: string,
): number {
    const firstRow = data[0];
    const lastRow = data.at(-1);

    if (!firstRow || !lastRow) {
        return 0;
    }

    const start = Number(firstRow[firstKey] ?? 0) + Number(firstRow[secondKey] ?? 0);
    const end = Number(lastRow[firstKey] ?? 0) + Number(lastRow[secondKey] ?? 0);

    if (start === 0) {
        return end > 0 ? 100 : 0;
    }

    return Number((((end - start) / start) * 100).toFixed(1));
}

export function DashboardLineChartPanel({
    title,
    description,
    data,
    series,
    className,
}: DashboardLineChartPanelProps): ReactNode {
    const chartUid = useId().replace(/:/g, '');
    const idLineGlow = `dashboard-line-glow-${chartUid}`;

    const chartConfig = series.reduce<ChartConfig>((config, item) => {
        config[item.key] = {
            label: item.label,
            color: item.color,
        };

        return config;
    }, {});

    const growth = growthPct(data, series[0]?.key ?? 'a', series[1]?.key ?? 'b');

    return (
        <DashboardCard className={className ?? 'gap-0 md:col-span-2'}>
            <CardHeader>
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <CardTitle>{title}</CardTitle>
                        <Delta value={growth} variant="badge">
                            <DeltaIcon variant="trend" />
                            <DeltaValue />
                        </Delta>
                    </div>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    className="aspect-auto h-60 w-full p-0 md:h-80"
                    config={chartConfig}
                >
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{ left: 12, right: 12, top: 8 }}
                    >
                        <CartesianGrid className="stroke-border" vertical={false} />
                        <XAxis
                            axisLine={false}
                            dataKey="label"
                            interval={0}
                            tickLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                            cursor={false}
                        />
                        <defs>
                            <filter
                                height="140%"
                                id={idLineGlow}
                                width="140%"
                                x="-20%"
                                y="-20%"
                            >
                                <feGaussianBlur result="blur" stdDeviation="10" />
                                <feComposite
                                    in="SourceGraphic"
                                    in2="blur"
                                    operator="over"
                                />
                            </filter>
                        </defs>
                        {series.map((item) => (
                            <Line
                                key={item.key}
                                dataKey={item.key}
                                dot={false}
                                filter={`url(#${idLineGlow})`}
                                stroke={`var(--color-${item.key})`}
                                strokeWidth={2}
                                type="step"
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </DashboardCard>
    );
}
