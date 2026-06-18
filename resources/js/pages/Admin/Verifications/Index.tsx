import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Verification = {
    id: number;
    status: string;
    submitted_at: string | null;
    creator: { id: number | null; name: string | null; email: string | null };
    documents_count: number;
};

type Props = {
    verifications: Verification[];
    pagination: { current_page: number; last_page: number; per_page: number; total: number };
};

export default function Index({ verifications, pagination }: Props) {
    return (
        <>
            <Head title="Antrian Verifikasi" />
            <main className="container mx-auto px-6 py-10 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Antrian Verifikasi Creator</CardTitle>
                        <CardDescription>
                            {pagination.total} pengajuan terdaftar. Pending ditampilkan di paling atas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {verifications.length === 0 ? (
                            <p className="text-sm text-slate-500">Tidak ada pengajuan.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="text-left">
                                    <tr>
                                        <th className="py-2">Creator</th>
                                        <th>Status</th>
                                        <th>Berkas</th>
                                        <th>Diajukan</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {verifications.map((v) => (
                                        <tr key={v.id} className="border-t">
                                            <td className="py-2">
                                                <div className="font-medium">{v.creator.name ?? '—'}</div>
                                                <div className="text-xs text-slate-500">{v.creator.email}</div>
                                            </td>
                                            <td>
                                                <Badge variant={v.status === 'pending' ? 'secondary' : 'outline'}>
                                                    {v.status}
                                                </Badge>
                                            </td>
                                            <td>{v.documents_count}</td>
                                            <td>{v.submitted_at ?? '—'}</td>
                                            <td>
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/verifications/${v.id}`}>Tinjau</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
