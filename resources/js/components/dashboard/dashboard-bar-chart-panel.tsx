'use client';

import type * as React from 'react';
import type { ReactNode } from 'react';
import { Bar, BarChart, XAxis } from 'recharts';

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

import type { DashboardDailyPoint } from '@/components/dashboard/types';

type DashboardBarChartPanelProps = {
    title: string;
    description: string;
    data: DashboardDailyPoint[];
    dataKey?: string;
    className?: string;
};

function CustomGradientBar(
    props: React.SVGProps<SVGRectElement> & {
        index?: number;
        dataKey?: string | number;
    },
): ReactNode {
    const {
        fill,
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        dataKey = 'value',
        index = 0,
    } = props;
    const gid = `gradient-bar-${String(dataKey)}-${index}`;

    return (
        <>
            <rect
                fill={`url(#${gid})`}
                height={height}
                stroke="none"
                width={width}
                x={x}
                y={y}
            />
            <rect fill={fill} height={2} stroke="none" width={width} x={x} y={y} />
            <defs>
                <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={fill} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={fill} stopOpacity={0} />
                </linearGradient>
            </defs>
        </>
    );
}

function growthPct(data: DashboardDailyPoint[]): number {
    const first = data[0]?.value ?? 0;
    const last = data.at(-1)?.value ?? 0;

    if (first === 0) {
        return last > 0 ? 100 : 0;
    }

    return Number((((last - first) / first) * 100).toFixed(1));
}

export function DashboardBarChartPanel({
    title,
    description,
    data,
    dataKey = 'value',
    className,
}: DashboardBarChartPanelProps): ReactNode {
    const chartConfig = {
        value: {
            label: title,
            color: 'var(--chart-2)',
        },
    } satisfies ChartConfig;

    const growth = growthPct(data);

    return (
        <DashboardCard className={className ?? 'gap-0 md:col-span-2'}>
            <CardHeader className="gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{title}</CardTitle>
                    <Delta value={growth} variant="badge">
                        <DeltaIcon variant="trend" />
                        <DeltaValue />
                    </Delta>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    className="aspect-auto h-60 w-full md:h-80"
                    config={chartConfig}
                >
                    <BarChart accessibilityLayer data={data}>
                        <XAxis
                            axisLine={false}
                            dataKey="label"
                            interval={0}
                            tickLine={false}
                            tickMargin={10}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                            cursor={false}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill="var(--color-value)"
                            shape={<CustomGradientBar />}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </DashboardCard>
    );
}
