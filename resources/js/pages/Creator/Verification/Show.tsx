import { Head, router } from '@inertiajs/react';
import { useState, useId } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
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
    documents: {
        id: number;
        type: string;
        type_label: string;
        original_name: string;
        download_url: string | null;
    }[];
} | null;

type Props = {
    profile: { id: number; verification_status: string; portfolio_count: number; has_profile: boolean };
    current_verification: CurrentVerification;
    document_types: DocumentType[];
};

export default function Show({ profile, current_verification, document_types }: Props): ReactNode {
    const [documents, setDocuments] = useState<DocumentEntry[]>([
        { type: document_types[0]?.value ?? 'identity_card', file: null },
    ]);
    const [processing, setProcessing] = useState(false);
    const baseId = useId();

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

            if (d.file) {
                fd.append(`documents[${i}][file]`, d.file);
            }
        });
        setProcessing(true);
        router.post('/creator/verification', fd, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
        });
    };

    const canSubmit = profile.has_profile && profile.portfolio_count > 0;

    return (
        <>
            <Head title="Verifikasi Creator" />
            <div>
                <PageHeader
                    title="Verifikasi Creator"
                    description="Ajukan verifikasi agar profil Anda tampil lebih kredibel di marketplace."
                />

                <div className="mt-8 max-w-3xl space-y-6">
                    <SectionPanel
                        title="Status Verifikasi"
                        description={`Status saat ini: ${profile.verification_status}`}
                    >
                        {!profile.has_profile ? (
                            <p className="text-sm text-destructive">Lengkapi profil Creator terlebih dahulu.</p>
                        ) : null}
                        {profile.has_profile && profile.portfolio_count === 0 ? (
                            <p className="text-sm text-destructive">Tambahkan minimal satu item portofolio.</p>
                        ) : null}
                        {current_verification ? (
                            <div className="mt-3 space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Status pengajuan:</span>
                                    <StatusBadge label={current_verification.status} tone="info" />
                                </div>
                                {current_verification.rejection_reason ? (
                                    <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive">
                                        Alasan penolakan: {current_verification.rejection_reason}
                                    </p>
                                ) : null}
                                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                                    {current_verification.documents.map((d) => (
                                        <li key={d.id}>
                                            {d.type_label} — {d.original_name}{' '}
                                            {d.download_url ? (
                                                <a
                                                    className="text-primary hover:underline"
                                                    href={d.download_url}
                                                >
                                                    unduh
                                                </a>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </SectionPanel>

                    <SectionPanel
                        title="Ajukan Verifikasi"
                        description="Unggah minimal 1 dokumen (KTP, bukti portofolio, dll)."
                    >
                        <form onSubmit={submit} className="space-y-4">
                            {documents.map((entry, i) => (
                                <div
                                    key={`${baseId}-${i}`}
                                    className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2"
                                >
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
                                            onChange={(e) =>
                                                updateEntry(i, { file: e.target.files?.[0] ?? null })
                                            }
                                        />
                                    </div>
                                    {documents.length > 1 ? (
                                        <div className="flex justify-end md:col-span-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeEntry(i)}
                                            >
                                                Hapus baris
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            ))}

                            <div className="flex items-center justify-between">
                                <Button type="button" variant="outline" onClick={addEntry}>
                                    + Tambah Dokumen
                                </Button>
                                <Button type="submit" disabled={!canSubmit || processing}>
                                    {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                                </Button>
                            </div>
                        </form>
                    </SectionPanel>
                </div>
            </div>
        </>
    );
}
