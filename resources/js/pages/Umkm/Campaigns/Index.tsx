import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { create } from '@/routes/umkm/campaigns';

type Campaign = {
    id: number;
    title: string;
    status: string;
    status_label: string;
    budget: string | null;
    deadline: string | null;
    is_hidden: boolean;
    pending_requests: number;
    has_collaboration: boolean;
    created_at: string;
};

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (status === 'open') return 'default';
    if (status === 'draft') return 'secondary';
    if (status === 'cancelled') return 'destructive';
    if (status === 'completed') return 'outline';
    return 'secondary';
}

export default function Index({ campaigns }: { campaigns: { data: Campaign[] } | Campaign[] }) {
    const list = Array.isArray(campaigns) ? campaigns : campaigns.data;

    return (
        <>
            <Head title="Campaign" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Campaign</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Kelola semua campaign Anda di satu tempat.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url}>+ Buat Campaign</Link>
                    </Button>
                </header>

                {list.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-slate-500">
                            Belum ada campaign. Buat campaign pertama Anda.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {list.map((c) => (
                            <Card key={c.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <CardTitle>
                                                <Link
                                                    href={`/umkm/campaigns/${c.id}`}
                                                    className="hover:underline"
                                                >
                                                    {c.title}
                                                </Link>
                                            </CardTitle>
                                            <CardDescription>
                                                {c.budget
                                                    ? `Rp ${Number(c.budget).toLocaleString('id-ID')}`
                                                    : 'Budget belum ditentukan'}
                                                {c.deadline ? ` • Deadline ${c.deadline}` : ''}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant={statusVariant(c.status)}>{c.status_label}</Badge>
                                            {c.is_hidden ? <Badge variant="destructive">Disembunyikan admin</Badge> : null}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div className="flex gap-4 text-slate-600 dark:text-slate-300">
                                            <span>Pengajuan: <strong>{c.pending_requests}</strong></span>
                                            <span>
                                                Kolaborasi:{' '}
                                                <strong>{c.has_collaboration ? 'Aktif' : 'Belum ada'}</strong>
                                            </span>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/umkm/campaigns/${c.id}`}>Detail</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
