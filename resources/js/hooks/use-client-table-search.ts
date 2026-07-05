import { useMemo, useState } from 'react';

type UseClientTableSearchResult<T> = {
    query: string;
    setQuery: (value: string) => void;
    filteredRows: T[];
    resultCount: number;
    totalCount: number;
};

export function useClientTableSearch<T>(
    rows: T[],
    getSearchText: (row: T) => string,
    initialQuery = '',
): UseClientTableSearchResult<T> {
    const [query, setQuery] = useState(initialQuery);

    const filteredRows = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (normalized === '') {
            return rows;
        }

        return rows.filter((row) =>
            getSearchText(row).toLowerCase().includes(normalized),
        );
    }, [getSearchText, query, rows]);

    return {
        query,
        setQuery,
        filteredRows,
        resultCount: filteredRows.length,
        totalCount: rows.length,
    };
}
