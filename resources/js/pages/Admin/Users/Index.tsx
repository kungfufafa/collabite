import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { StatusBadge } from '@/components/app/status-badge';
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
    filters?: { role?: string | null; status?: string | null };
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
    return (
        <>
            <Head title="Pengguna" />
            <div>
                <PageHeader
                    description={`Kelola akun UMKM, Creator, dan Admin. Filter: role=${filters?.role ?? 'semua'}, status=${filters?.status ?? 'semua'}.`}
                    title="Daftar Pengguna"
                />

                <div className="mt-8">
                    <WorkspaceTable
                        columns={[
                            {
                                header: 'Nama',
                                cell: (u) => (
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {u.email}
                                        </p>
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
                                            u.account_status === 'active'
                                                ? 'success'
                                                : 'danger'
                                        }
                                    />
                                ),
                            },
                            {
                                header: 'Aksi',
                                className: 'text-right',
                                cell: (u) => (
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
                                ),
                            },
                        ]}
                        emptyDescription="Pengguna akan muncul setelah registrasi."
                        emptyTitle="Belum ada pengguna"
                        getRowKey={(u) => u.id}
                        rows={users.data}
                    />
                </div>
            </div>
        </>
    );
}
