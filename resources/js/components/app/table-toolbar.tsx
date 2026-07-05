import { Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

import { brutalPanel } from '@/components/collabite/landing/brutal-styles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type TableToolbarProps = {
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: (event: FormEvent<HTMLFormElement>) => void;
    resultCount?: number;
    totalCount?: number;
    filtersSlot?: ReactNode;
    className?: string;
};

export function TableToolbar({
    searchPlaceholder = 'Cari...',
    searchValue = '',
    onSearchChange,
    onSearchSubmit,
    resultCount,
    totalCount,
    filtersSlot,
    className,
}: TableToolbarProps): ReactNode {
    const showCount =
        typeof resultCount === 'number' && typeof totalCount === 'number';

    return (
        <div
            className={cn(
                brutalPanel,
                'flex flex-col gap-3 border-b-0 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
            data-testid="table-toolbar"
        >
            <form
                className="flex w-full max-w-md items-center gap-2"
                onSubmit={
                    onSearchSubmit ??
                    ((event) => {
                        event.preventDefault();
                    })
                }
            >
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        aria-label={searchPlaceholder}
                        className="pl-9"
                        data-testid="table-search-input"
                        onChange={(event) => onSearchChange?.(event.target.value)}
                        placeholder={searchPlaceholder}
                        value={searchValue}
                    />
                </div>
                {onSearchSubmit ? (
                    <Button size="sm" type="submit" variant="secondary">
                        Cari
                    </Button>
                ) : null}
            </form>

            <div className="flex flex-wrap items-center gap-3">
                {showCount ? (
                    <p className="text-xs font-bold text-muted-foreground tabular-nums">
                        Menampilkan {resultCount} dari {totalCount} data
                    </p>
                ) : null}
                {filtersSlot}
            </div>
        </div>
    );
}
