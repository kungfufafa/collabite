import { Link } from '@inertiajs/react';
import { ArrowRightIcon } from 'lucide-react';
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
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type { DashboardTableRow } from '@/components/dashboard/types';

type DashboardTablePanelProps = {
    title: string;
    description: string;
    rows: DashboardTableRow[];
    primaryColumn?: string;
    secondaryColumn?: string;
    tertiaryColumn?: string;
    viewAllHref?: string;
    viewAllLabel?: string;
    className?: string;
    emptyMessage?: string;
};

export function DashboardTablePanel({
    title,
    description,
    rows,
    primaryColumn = 'Judul',
    secondaryColumn = 'Detail',
    tertiaryColumn = 'Status',
    viewAllHref,
    viewAllLabel = 'Lihat semua',
    className,
    emptyMessage = 'Belum ada data.',
}: DashboardTablePanelProps): ReactNode {
    return (
        <DashboardCard className={className ?? 'relative gap-0 md:col-span-2'}>
            <CardHeader className="border-b">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="mask-b-from-50% mask-b-to-100% px-0">
                {rows.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                ) : (
                    <Table>
                        <TableCaption className="sr-only">{title}</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="ps-6">{primaryColumn}</TableHead>
                                <TableHead>{secondaryColumn}</TableHead>
                                <TableHead className="pe-6 text-right">
                                    {tertiaryColumn}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow className="h-12" key={row.id}>
                                    <TableCell className="max-w-40 truncate ps-6 font-medium">
                                        <Link
                                            href={row.href}
                                            className="hover:underline"
                                            prefetch
                                        >
                                            {row.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-32 truncate text-muted-foreground">
                                        {row.meta ?? '—'}
                                    </TableCell>
                                    <TableCell className="pe-6 text-right text-muted-foreground">
                                        {row.status ?? '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            {viewAllHref ? (
                <div className="mask-t-from-30% absolute inset-x-0 bottom-0 flex h-1/5 items-center justify-center bg-background">
                    <Button asChild className="relative" variant="ghost">
                        <Link href={viewAllHref} prefetch>
                            {viewAllLabel}
                            <ArrowRightIcon aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            ) : null}
        </DashboardCard>
    );
}
