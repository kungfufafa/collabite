import { TableToolbar } from '@/components/app/table-toolbar';
import { useClientTableSearch } from '@/hooks/use-client-table-search';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCallback } from 'react';
import { describe, expect, it, vi } from 'vitest';

describe('useClientTableSearch', () => {
    it('filters rows by query', async () => {
        function Probe(): React.ReactElement {
            const getSearchText = useCallback(
                (row: { name: string }) => row.name,
                [],
            );
            const { query, setQuery, filteredRows } = useClientTableSearch(
                [{ name: 'Alpha' }, { name: 'Beta' }],
                getSearchText,
            );

            return (
                <div>
                    <input
                        aria-label="search"
                        onChange={(event) => setQuery(event.target.value)}
                        value={query}
                    />
                    <ul>
                        {filteredRows.map((row) => (
                            <li key={row.name}>{row.name}</li>
                        ))}
                    </ul>
                </div>
            );
        }

        render(<Probe />);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText('search'), 'alp');

        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });
});

describe('TableToolbar', () => {
    it('renders search input and result count', () => {
        render(
            <TableToolbar
                onSearchChange={vi.fn()}
                resultCount={2}
                searchValue=""
                totalCount={5}
            />,
        );

        expect(screen.getByTestId('table-search-input')).toBeInTheDocument();
        expect(screen.getByText('Menampilkan 2 dari 5 data')).toBeInTheDocument();
    });
});
