import type { FormEvent, ReactNode } from 'react';

import { brutalPanel } from '@/components/collabite/landing/brutal-styles';
import { ListEmptyState } from '@/components/app/list-empty-state';
import { TablePagination } from '@/components/app/table-pagination';
import { TableToolbar } from '@/components/app/table-toolbar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Column<T> = {
    header: string;
    className?: string;
    headClassName?: string;
    cell: (row: T) => ReactNode;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type WorkspaceTableSearchProps = {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
    resultCount?: number;
    totalCount?: number;
};

type WorkspaceTableProps<T> = {
    columns: Column<T>[];
    rows: T[];
    emptyTitle: string;
    emptyDescription?: string;
    getRowKey: (row: T) => string | number;
    className?: string;
    search?: WorkspaceTableSearchProps;
    paginationLinks?: PaginationLink[];
    filtersSlot?: ReactNode;
};

export function WorkspaceTable<T>({
    columns,
    rows,
    emptyTitle,
    emptyDescription,
    getRowKey,
    className,
    search,
    paginationLinks,
    filtersSlot,
}: WorkspaceTableProps<T>): ReactNode {
    const hasToolbar = search !== undefined || filtersSlot !== undefined;

    if (rows.length === 0 && !hasToolbar) {
        return (
            <ListEmptyState
                description={emptyDescription}
                title={emptyTitle}
            />
        );
    }

    return (
        <div className={cn('space-y-0', className)} data-testid="workspace-table">
            {hasToolbar ? (
                <TableToolbar
                    filtersSlot={filtersSlot}
                    onSearchChange={search?.onChange}
                    onSearchSubmit={search?.onSubmit}
                    resultCount={search?.resultCount}
                    searchPlaceholder={search?.placeholder}
                    searchValue={search?.value ?? ''}
                    totalCount={search?.totalCount}
                />
            ) : null}

            <div
                className={cn(
                    brutalPanel,
                    'max-w-full overflow-x-auto md:overflow-x-visible',
                    hasToolbar ? 'border-t-0 shadow-none' : '',
                    paginationLinks && paginationLinks.length > 1
                        ? 'border-b-0'
                        : '',
                )}
            >
                {rows.length === 0 ? (
                    <div className="px-4 py-10">
                        <ListEmptyState
                            description={emptyDescription}
                            title={emptyTitle}
                        />
                    </div>
                ) : (
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="border-[var(--neutral-900)] hover:bg-transparent">
                                {columns.map((column) => (
                                    <TableHead
                                        className={cn(
                                            'h-11 border-[var(--neutral-900)] px-2 text-xs font-black tracking-wide text-muted-foreground uppercase lg:px-3',
                                            column.headClassName,
                                            column.className?.includes('text-right')
                                                ? 'text-right'
                                                : undefined,
                                        )}
                                        key={column.header}
                                    >
                                        {column.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={getRowKey(row)}
                                    className="border-[var(--neutral-900)]"
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            className={cn(
                                                'px-2 py-3 align-middle text-sm font-medium whitespace-normal text-foreground lg:px-3',
                                                column.className,
                                            )}
                                            key={column.header}
                                        >
                                            {column.cell(row)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {paginationLinks ? (
                <TablePagination links={paginationLinks} />
            ) : null}
        </div>
    );
}
