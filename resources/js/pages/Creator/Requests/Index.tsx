import { Form as InertiaForm, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { accept, cancel, reject } from '@/actions/App/Http/Controllers/Creator/RequestsController';
import { FlashBanner } from '@/components/app/flash-banner';
import { StatusBadge } from '@/components/app/status-badge';
import { WorkspacePage } from '@/components/app/workspace-page';
import { brutalEmptyState, brutalPanel } from '@/components/collabite/landing/brutal-styles';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { index as creatorCampaignsIndex } from '@/routes/creator/campaigns';

type RequestItem = {
    id: number;
    type: string;
    type_label: string;
    message: string | null;
    created_at: string;
    campaign: { id: number; title: string; budget: string | null };
    umkm: { name: string };
};

function formatCurrency(amount: string | null): string {
    if (amount === null || amount === '') {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(amount));
}

export default function Index({ requests }: { requests: RequestItem[] }): ReactNode {
    const flash = usePage().props.status as string | undefined;
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    return (
        <>
            <Head title="Permintaan Kolaborasi" />
            <WorkspacePage
                description="Kelola lamaran yang Anda kirim dan undangan dari UMKM."
                title="Permintaan Kolaborasi"
            >
                {flash ? <FlashBanner message={flash} /> : null}

                {requests.length === 0 ? (
                    <div className={brutalEmptyState}>
                        <p className="text-sm text-muted-foreground">
                            Tidak ada permintaan menunggu respons.
                        </p>
                        <Button asChild className="mt-4" variant="outline">
                            <Link href={creatorCampaignsIndex()}>Cari Campaign</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((item) => (
                            <div
                                key={item.id}
                                className={brutalPanel + ' p-4'}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge
                                                label={item.type_label}
                                                tone={item.type === 'invitation' ? 'info' : 'warning'}
                                            />
                                            <Link
                                                className="font-medium text-foreground hover:underline"
                                                href={`/creator/campaigns/${item.campaign.id}`}
                                            >
                                                {item.campaign.title}
                                            </Link>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item.umkm.name} · Budget {formatCurrency(item.campaign.budget)}
                                        </p>
                                        {item.message ? (
                                            <p className="mt-2 text-sm">{item.message}</p>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.created_at}</p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {item.type === 'invitation' ? (
                                        <>
                                            <InertiaForm {...accept.form(item.id)}>
                                                {({ processing }) => (
                                                    <Button
                                                        disabled={processing}
                                                        size="sm"
                                                        type="submit"
                                                        variant="success"
                                                    >
                                                        Terima Undangan
                                                    </Button>
                                                )}
                                            </InertiaForm>
                                            {rejectingId === item.id ? (
                                                <InertiaForm
                                                    {...reject.form(item.id)}
                                                    className="flex w-full flex-col gap-2 sm:w-auto"
                                                    onSuccess={() => {
                                                        setRejectingId(null);
                                                        setRejectReason('');
                                                    }}
                                                >
                                                    {({ processing, errors }) => (
                                                        <>
                                                            <Textarea
                                                                name="reason"
                                                                placeholder="Alasan penolakan (opsional)"
                                                                rows={2}
                                                                value={rejectReason}
                                                                onChange={(e) => setRejectReason(e.target.value)}
                                                            />
                                                            <InputError message={errors.reason} />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    disabled={processing}
                                                                    size="sm"
                                                                    type="submit"
                                                                    variant="destructive"
                                                                >
                                                                    Tolak
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => setRejectingId(null)}
                                                                >
                                                                    Batal
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </InertiaForm>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => setRejectingId(item.id)}
                                                >
                                                    Tolak
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <InertiaForm {...cancel.form(item.id)}>
                                            {({ processing }) => (
                                                <Button
                                                    disabled={processing}
                                                    size="sm"
                                                    type="submit"
                                                    variant="destructive"
                                                >
                                                    Batalkan Lamaran
                                                </Button>
                                            )}
                                        </InertiaForm>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </WorkspacePage>
        </>
    );
}
