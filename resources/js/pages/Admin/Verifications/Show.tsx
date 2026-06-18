import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Verification = {
    id: number;
    status: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    creator: { id: number | null; name: string | null; email: string | null };
    reviewer: { id: number; name: string } | null;
    documents_count: number;
    documents: { id: number; type: string; type_label: string; original_name: string; mime_type: string; size: number; download_url: string | null }[];
};

type Props = { verification: Verification };

export default function Show({ verification }: Props) {
    const reject = useForm({ rejection_reason: '' });

    const approve: FormEventHandler = (e) => {
        e.preventDefault();
        if (!confirm('Setujui verifikasi ini?')) return;
        reject.post(`/admin/verifications/${verification.id}/approve`);
    };

    const rejectSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        reject.post(`/admin/verifications/${verification.id}/reject`);
    };

    return (
        <>
            <Head title={`Verifikasi #${verification.id}`} />
            <main className="container mx-auto max-w-3xl px-6 py-10 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pengajuan #{verification.id}</CardTitle>
                        <CardDescription>
                            Creator: {verification.creator.name} ({verification.creator.email})
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span>Status:</span>
                            <Badge>{verification.status}</Badge>
                        </div>
                        <p>Diajukan: {verification.submitted_at ?? '—'}</p>
                        {verification.reviewed_at && (
                            <p>Ditinjau: {verification.reviewed_at} oleh {verification.reviewer?.name ?? '—'}</p>
                        )}
                        {verification.rejection_reason && (
                            <p className="rounded bg-red-50 p-3 text-red-700">
                                Alasan: {verification.rejection_reason}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Berkas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-sm">
                            {verification.documents.map((d) => (
                                <li key={d.id}>
                                    {d.type_label} - {d.original_name}{' '}
                                    {d.download_url && (
                                        <a className="text-blue-600 hover:underline" href={d.download_url}>
                                            unduh
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {verification.status === 'pending' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tindakan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={approve}>
                                <Button type="submit" disabled={reject.processing}>
                                    Setujui
                                </Button>
                            </form>
                            <form onSubmit={rejectSubmit} className="space-y-2">
                                <Label htmlFor="rejection_reason">Alasan Penolakan</Label>
                                <Textarea
                                    id="rejection_reason"
                                    value={reject.data.rejection_reason}
                                    onChange={(e) => reject.setData('rejection_reason', e.target.value)}
                                    rows={3}
                                />
                                {reject.errors.rejection_reason && (
                                    <p className="text-sm text-red-600">{reject.errors.rejection_reason}</p>
                                )}
                                <Button type="submit" variant="destructive" disabled={reject.processing}>
                                    Tolak
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </main>
        </>
    );
}
