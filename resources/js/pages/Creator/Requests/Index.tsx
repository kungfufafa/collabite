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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { index as creatorCampaignsIndex } from '@/routes/creator/campaigns';
import { terms } from '@/routes/public';

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
    const [termsAccepted, setTermsAccepted] = useState<Record<number, boolean>>({});

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
                        <Button asChild className="mt-4">
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

                                <div className="mt-4">
                                    {item.type === 'invitation' ? (
                                        <div className="flex flex-col gap-3 border-t-2 border-[var(--neutral-900)] pt-3">
                                            <InertiaForm
                                                {...accept.form(item.id)}
                                                className="flex flex-col gap-3"
                                            >
                                                {({ processing, errors }) => (
                                                    <>
                                                        <input
                                                            name="terms_accepted"
                                                            type="hidden"
                                                            value={termsAccepted[item.id] ? '1' : '0'}
                                                        />
                                                        <label
                                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                                            htmlFor={`terms-accept-${item.id}`}
                                                        >
                                                            <Checkbox
                                                                checked={termsAccepted[item.id] === true}
                                                                className="mt-0.5"
                                                                id={`terms-accept-${item.id}`}
                                                                onCheckedChange={(checked) =>
                                                                    setTermsAccepted((prev) => ({
                                                                        ...prev,
                                                                        [item.id]: checked === true,
                                                                    }))
                                                                }
                                                            />
                                                            <span>
                                                                Saya telah membaca dan menyetujui{' '}
                                                                <Link
                                                                    className="font-bold text-foreground underline underline-offset-4"
                                                                    href={terms()}
                                                                    target="_blank"
                                                                >
                                                                    Syarat dan Ketentuan
                                                                </Link>{' '}
                                                                Collabite.
                                                            </span>
                                                        </label>
                                                        <InputError message={errors.terms_accepted} />
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Button
                                                                disabled={
                                                                    processing ||
                                                                    termsAccepted[item.id] !== true
                                                                }
                                                                size="sm"
                                                                type="submit"
                                                            >
                                                                Terima Undangan
                                                            </Button>
                                                            {rejectingId === item.id ? null : (
                                                                <Button
                                                                    size="sm"
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => setRejectingId(item.id)}
                                                                >
                                                                    Tolak
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </InertiaForm>
                                            {rejectingId === item.id ? (
                                                <InertiaForm
                                                    {...reject.form(item.id)}
                                                    className="flex flex-col gap-2"
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
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Button
                                                                    disabled={processing}
                                                                    size="sm"
                                                                    type="submit"
                                                                    variant="destructive"
                                                                >
                                                                    Konfirmasi Tolak
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
                                            ) : null}
                                        </div>
                                    ) : (
                                        <InertiaForm {...cancel.form(item.id)}>
                                            {({ processing }) => (
                                                <Button
                                                    disabled={processing}
                                                    size="sm"
                                                    type="submit"
                                                    variant="outline"
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
