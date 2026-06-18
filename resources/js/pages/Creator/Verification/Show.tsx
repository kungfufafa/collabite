import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DocumentType = { value: string; label: string };

type DocumentEntry = { type: string; file: File | null };

type CurrentVerification = {
    id: number;
    status: string;
    rejection_reason: string | null;
    submitted_at: string | null;
    documents: { id: number; type: string; type_label: string; original_name: string; download_url: string | null }[];
} | null;

type Props = {
    profile: { id: number; verification_status: string; portfolio_count: number; has_profile: boolean };
    current_verification: CurrentVerification;
    document_types: DocumentType[];
};

export default function Show({ profile, current_verification, document_types }: Props) {
    const [documents, setDocuments] = useState<DocumentEntry[]>([
        { type: document_types[0]?.value ?? 'identity_card', file: null },
    ]);

    const form = useForm({ documents: [] as DocumentEntry[] });

    const updateEntry = (index: number, patch: Partial<DocumentEntry>): void => {
        setDocuments((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    };

    const addEntry = (): void => {
        setDocuments((prev) => [...prev, { type: document_types[0]?.value ?? 'identity_card', file: null }]);
    };

    const removeEntry = (index: number): void => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const submit = (e: FormEvent): void => {
        e.preventDefault();
        const fd = new FormData();
        documents.forEach((d, i) => {
            fd.append(`documents[${i}][type]`, d.type);
            if (d.file) fd.append(`documents[${i}][file]`, d.file);
        });
        form.transform(() => fd).post('/creator/verification', { forceFormData: true });
    };

    const canSubmit = profile.has_profile && profile.portfolio_count > 0;

    return (
        <>
            <Head title="Verifikasi Creator" />
            <main className="container mx-auto max-w-3xl px-6 py-10 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Status Verifikasi</CardTitle>
                        <CardDescription>
                            Status saat ini: <strong>{profile.verification_status}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!profile.has_profile && (
                            <p className="text-sm text-red-600">Lengkapi profil Creator terlebih dahulu.</p>
                        )}
                        {profile.has_profile && profile.portfolio_count === 0 && (
                            <p className="text-sm text-red-600">Tambahkan minimal satu item portofolio.</p>
                        )}
                        {current_verification && (
                            <div className="mt-3 space-y-2 text-sm">
                                <p>Status pengajuan: <strong>{current_verification.status}</strong></p>
                                {current_verification.rejection_reason && (
                                    <p className="rounded bg-red-50 p-3 text-red-700">
                                        Alasan penolakan: {current_verification.rejection_reason}
                                    </p>
                                )}
                                <ul className="list-disc pl-5">
                                    {current_verification.documents.map((d) => (
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
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ajukan Verifikasi</CardTitle>
                        <CardDescription>Unggah minimal 1 dokumen (KTP, bukti portofolio, dll).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {documents.map((entry, i) => (
                                <div key={i} className="grid gap-3 rounded border p-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Jenis Dokumen</Label>
                                        <Select
                                            value={entry.type}
                                            onValueChange={(v) => updateEntry(i, { type: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {document_types.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Berkas</Label>
                                        <Input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => updateEntry(i, { file: e.target.files?.[0] ?? null })}
                                        />
                                    </div>
                                    {documents.length > 1 && (
                                        <div className="md:col-span-2 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeEntry(i)}
                                            >
                                                Hapus baris
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center justify-between">
                                <Button type="button" variant="outline" onClick={addEntry}>
                                    + Tambah Dokumen
                                </Button>
                                <Button type="submit" disabled={!canSubmit || form.processing}>
                                    Kirim Pengajuan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
