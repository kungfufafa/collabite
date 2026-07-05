import { Form as InertiaForm } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { SectionPanel } from '@/components/app/section-panel';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Payment = {
    id: number;
    amount: string;
    status: string;
    status_label: string;
    note: string | null;
    proof_url: string | null;
    proof_original_name: string | null;
    submitted_at: string | null;
    confirmed_at: string | null;
};

type CollaborationPaymentPanelProps = {
    payment: Payment | null;
    budget: string | number | null;
    isUmkm: boolean;
    collaborationId: number;
    submitProofForm?: {
        form: (collaboration: number) => {
            action: string;
            method: 'post';
            options?: Record<string, unknown>;
        };
    };
    confirmPaymentForm?: {
        form: (collaboration: number) => {
            action: string;
            method: 'post';
            options?: Record<string, unknown>;
        };
    };
};

function formatCurrency(amount: string | number | null): string {
    if (amount === null || amount === '') {
        return '-';
    }

    const value = typeof amount === 'string' ? Number(amount) : amount;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

export function CollaborationPaymentPanel({
    payment,
    budget,
    isUmkm,
    collaborationId,
    submitProofForm,
    confirmPaymentForm,
}: CollaborationPaymentPanelProps): ReactNode {
    const displayAmount = payment?.amount ?? budget;

    return (
        <SectionPanel
            title="Pembayaran"
            description="Transfer manual sesuai budget campaign, lalu unggah bukti transfer. Creator mengonfirmasi setelah dana diterima."
        >
            <div className="space-y-4">
                <div className="border-2 border-[var(--neutral-900)] bg-[var(--neutral-100)] p-4 shadow-[2px_2px_0_0_var(--neutral-900)]">
                    <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                        Jumlah yang disepakati
                    </p>
                    <p className="text-lg font-black">{formatCurrency(displayAmount)}</p>
                    {payment ? (
                        <p className="mt-2 text-sm">
                            Status:{' '}
                            <span className="font-medium">{payment.status_label}</span>
                        </p>
                    ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                            Record pembayaran dibuat setelah konten disetujui.
                        </p>
                    )}
                </div>

                {payment?.proof_url ? (
                    <div className="border-2 border-[var(--neutral-900)] bg-white p-3 shadow-[2px_2px_0_0_var(--neutral-900)]">
                        <p className="text-sm font-black uppercase tracking-wide">Bukti transfer</p>
                        <a
                            className="mt-1 inline-block text-sm text-[var(--brand-primary-hover)] underline"
                            href={payment.proof_url}
                        >
                            {payment.proof_original_name ?? 'Lihat bukti'}
                        </a>
                        {payment.note ? (
                            <p className="mt-2 text-sm text-muted-foreground">{payment.note}</p>
                        ) : null}
                    </div>
                ) : null}

                {isUmkm && submitProofForm && payment?.status === 'pending_proof' ? (
                    <InertiaForm
                        {...submitProofForm.form(collaborationId)}
                        encType="multipart/form-data"
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium" htmlFor="payment-proof">
                                        Unggah bukti transfer
                                    </label>
                                    <input
                                        accept="image/jpeg,image/png,application/pdf"
                                        className="mt-1 block w-full text-sm"
                                        id="payment-proof"
                                        name="proof"
                                        required
                                        type="file"
                                    />
                                    <InputError className="mt-1" message={errors.proof} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium" htmlFor="payment-note">
                                        Catatan (opsional)
                                    </label>
                                    <Textarea
                                        id="payment-note"
                                        maxLength={500}
                                        name="note"
                                        placeholder="Contoh: transfer via BCA, ref 123456"
                                        rows={2}
                                    />
                                    <InputError className="mt-1" message={errors.note} />
                                </div>
                                <Button disabled={processing} type="submit" variant="info">
                                    Kirim Bukti Pembayaran
                                </Button>
                            </div>
                        )}
                    </InertiaForm>
                ) : null}

                {!isUmkm && confirmPaymentForm && payment?.status === 'awaiting_confirmation' ? (
                    <InertiaForm {...confirmPaymentForm.form(collaborationId)}>
                        {({ processing }) => (
                            <Button disabled={processing} type="submit" variant="success">
                                Konfirmasi Pembayaran Diterima
                            </Button>
                        )}
                    </InertiaForm>
                ) : null}

                {payment?.status === 'confirmed' ? (
                    <p className="text-sm text-emerald-700">
                        Pembayaran telah dikonfirmasi
                        {payment.confirmed_at ? ` pada ${payment.confirmed_at}` : ''}.
                    </p>
                ) : null}
            </div>
        </SectionPanel>
    );
}
