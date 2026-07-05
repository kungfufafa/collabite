import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { StatusBadge } from '@/components/app/status-badge';
import { TableRowActions } from '@/components/app/table-row-actions';
import { WorkspacePage } from '@/components/app/workspace-page';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { Button } from '@/components/ui/button';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
    account_status: string;
    created_at: string;
};

type Props = {
    users: {
        data: User[];
        links?: { url: string | null; label: string; active: boolean }[];
    };
    filters?: { role?: string | null; status?: string | null; q?: string | null };
};

function roleTone(role: string): 'brand' | 'info' | 'neutral' {
    if (role === 'admin') {
        return 'brand';
    }

    if (role === 'creator') {
        return 'info';
    }

    return 'neutral';
}

export default function AdminUsersIndex({ users, filters }: Props): ReactNode {
    const [query, setQuery] = useState(filters?.q ?? '');

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.get(
            '/admin/users',
            {
                q: query || undefined,
                role: filters?.role || undefined,
                status: filters?.status || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Pengguna" />
            <WorkspacePage
                description="Kelola akun UMKM, Creator, dan Admin."
                title="Daftar Pengguna"
            >
                <WorkspaceTable
                    columns={[
                        {
                            header: 'Nama',
                            cell: (u) => (
                                <div className="min-w-[12rem]">
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                            ),
                        },
                        {
                            header: 'Role',
                            cell: (u) => (
                                <StatusBadge
                                    label={u.role_label}
                                    tone={roleTone(u.role)}
                                />
                            ),
                        },
                        {
                            header: 'Status',
                            cell: (u) => (
                                <StatusBadge
                                    label={u.account_status}
                                    tone={
                                        u.account_status === 'active' ? 'success' : 'danger'
                                    }
                                />
                            ),
                        },
                        {
                            header: 'Terdaftar',
                            cell: (u) => u.created_at,
                        },
                        {
                            header: 'Aksi',
                            className: 'text-right',
                            cell: (u) => (
                                <TableRowActions>
                                    <Form
                                        action={`/admin/users/${u.id}/status`}
                                        className="inline-flex"
                                        method="patch"
                                    >
                                        <input
                                            name="account_status"
                                            type="hidden"
                                            value={
                                                u.account_status === 'active'
                                                    ? 'suspended'
                                                    : 'active'
                                            }
                                        />
                                        <Button size="sm" type="submit" variant="outline">
                                            {u.account_status === 'active'
                                                ? 'Suspend'
                                                : 'Aktifkan'}
                                        </Button>
                                    </Form>
                                </TableRowActions>
                            ),
                        },
                    ]}
                    emptyDescription="Pengguna akan muncul setelah registrasi."
                    emptyTitle="Belum ada pengguna"
                    getRowKey={(u) => u.id}
                    paginationLinks={users.links}
                    rows={users.data}
                    search={{
                        onChange: setQuery,
                        onSubmit: handleSearchSubmit,
                        placeholder: 'Cari nama atau email...',
                        resultCount: users.data.length,
                        totalCount: users.data.length,
                        value: query,
                    }}
                />
            </WorkspacePage>
        </>
    );
}
