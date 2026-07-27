import type { CollaborationTab } from '@/layouts/collaboration-workspace-layout';

export type CollaborationNextStep = {
    description: string;
    actionLabel: string;
    tab: CollaborationTab;
};

type SubmissionLike = {
    status: string;
};

type PaymentLike = {
    status: string;
} | null;

type CollaborationLike = {
    status: string;
    submissions: SubmissionLike[];
    payment: PaymentLike;
};

export function resolveUmkmCollaborationNextStep(
    collaboration: CollaborationLike,
    manualPaymentEnabled: boolean,
): CollaborationNextStep | null {
    if (collaboration.status === 'completed') {
        return {
            description: 'Kolaborasi selesai. Kirim review untuk Creator.',
            actionLabel: 'Buka Review',
            tab: 'review',
        };
    }

    if (collaboration.status !== 'active') {
        return null;
    }

    const hasInReview = collaboration.submissions.some((s) => s.status === 'in_review');
    if (hasInReview) {
        return {
            description: 'Ada konten menunggu tinjauanmu. Setujui atau minta revisi.',
            actionLabel: 'Tinjau Konten',
            tab: 'content',
        };
    }

    const hasApproved = collaboration.submissions.some((s) => s.status === 'approved');
    const paymentConfirmed = collaboration.payment?.status === 'confirmed';

    if (hasApproved && manualPaymentEnabled && !paymentConfirmed) {
        return {
            description: 'Konten disetujui. Unggah bukti pembayaran untuk Creator.',
            actionLabel: 'Buka Pembayaran',
            tab: 'payment',
        };
    }

    if (hasApproved && (!manualPaymentEnabled || paymentConfirmed)) {
        return {
            description: 'Siap menutup kolaborasi. Selesaikan lalu kirim review.',
            actionLabel: 'Buka Review',
            tab: 'review',
        };
    }

    return {
        description:
            'Belum ada konten dari Creator. Buka tab Konten untuk memantau, atau kirim pesan bila perlu koordinasi.',
        actionLabel: 'Buka Konten',
        tab: 'content',
    };
}

export function resolveCreatorCollaborationNextStep(
    collaboration: CollaborationLike,
    manualPaymentEnabled: boolean,
): CollaborationNextStep | null {
    if (collaboration.status === 'completed') {
        return {
            description: 'Kolaborasi selesai. Kirim review untuk UMKM.',
            actionLabel: 'Buka Review',
            tab: 'review',
        };
    }

    if (collaboration.status !== 'active') {
        return null;
    }

    const hasDraft = collaboration.submissions.some((s) => s.status === 'draft');
    if (hasDraft) {
        return {
            description: 'Ada draf konten. Kirim untuk review UMKM.',
            actionLabel: 'Buka Konten',
            tab: 'content',
        };
    }

    const hasRevision = collaboration.submissions.some((s) => s.status === 'revision_requested');
    if (hasRevision) {
        return {
            description: 'UMKM meminta revisi. Unggah revisi konten.',
            actionLabel: 'Buka Konten',
            tab: 'content',
        };
    }

    if (manualPaymentEnabled && collaboration.payment?.status === 'awaiting_confirmation') {
        return {
            description: 'Bukti pembayaran menunggu konfirmasimu.',
            actionLabel: 'Buka Pembayaran',
            tab: 'payment',
        };
    }

    const hasInReview = collaboration.submissions.some((s) => s.status === 'in_review');
    if (hasInReview) {
        return {
            description: 'Konten sedang ditinjau UMKM. Tidak ada aksi dari sisi Anda saat ini.',
            actionLabel: 'Lihat Status Konten',
            tab: 'content',
        };
    }

    const hasApproved = collaboration.submissions.some((s) => s.status === 'approved');
    if (hasApproved) {
        return {
            description: 'Konten disetujui. Tunggu pembayaran atau penyelesaian dari UMKM.',
            actionLabel: manualPaymentEnabled ? 'Buka Pembayaran' : 'Lihat Status Konten',
            tab: manualPaymentEnabled ? 'payment' : 'content',
        };
    }

    return {
        description: 'Unggah konten pertama untuk campaign ini.',
        actionLabel: 'Buka Konten',
        tab: 'content',
    };
}
