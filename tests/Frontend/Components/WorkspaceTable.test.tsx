import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCallback } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TableToolbar } from '@/components/app/table-toolbar';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { useClientTableSearch } from '@/hooks/use-client-table-search';

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

describe('WorkspaceTable', () => {
    it('constrains long cell content inside fixed table columns', () => {
        render(
            <WorkspaceTable
                columns={[
                    {
                        header: 'Creator',
                        cell: (row) => row.email,
                    },
                    {
                        header: 'Status',
                        cell: (row) => row.status,
                    },
                ]}
                emptyTitle="Tidak ada data"
                getRowKey={(row) => row.id}
                rows={[
                    {
                        id: 1,
                        email: 'creator03.e2e.1783246739286@collabite.test',
                        status: 'verified',
                    },
                ]}
            />,
        );

        expect(screen.getByRole('table')).toHaveClass('table-fixed');
        expect(screen.getByText(/1783246739286/).closest('td')).toHaveClass(
            'min-w-0',
            'overflow-hidden',
            '[overflow-wrap:anywhere]',
        );
    });
});
