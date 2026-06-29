import type { ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import { cn } from '@/lib/utils';

type Column<T> = {
    header: string;
    className?: string;
    cell: (row: T) => ReactNode;
};

type WorkspaceTableProps<T> = {
    columns: Column<T>[];
    rows: T[];
    emptyTitle: string;
    emptyDescription?: string;
    getRowKey: (row: T) => string | number;
    className?: string;
};

export function WorkspaceTable<T>({
    columns,
    rows,
    emptyTitle,
    emptyDescription,
    getRowKey,
    className,
}: WorkspaceTableProps<T>): ReactNode {
    if (rows.length === 0) {
        return (
            <ListEmptyState
                description={emptyDescription}
                title={emptyTitle}
            />
        );
    }

    return (
        <div
            className={cn(
                'overflow-x-auto rounded-xl border border-border bg-card',
                className,
            )}
        >
            <table className="w-full min-w-[640px] text-sm">
                <thead>
                    <tr className="border-b border-border text-left">
                        {columns.map((column) => (
                            <th
                                className={cn(
                                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                                    column.className,
                                )}
                                key={column.header}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            className="border-b border-border last:border-b-0"
                            key={getRowKey(row)}
                        >
                            {columns.map((column) => (
                                <td
                                    className={cn(
                                        'px-4 py-3 align-top text-foreground',
                                        column.className,
                                    )}
                                    key={column.header}
                                >
                                    {column.cell(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
