import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { brutalCard } from '@/components/collabite/landing/brutal-styles';
import { SectionHeading } from '@/components/collabite/section-heading';
import { cn } from '@/lib/utils';

const FAQS = [
    {
        q: 'Apa itu Collabite?',
        a: 'Collabite adalah platform kolaborasi yang menghubungkan UMKM dengan content creator untuk membuat dan mengelola campaign konten promosi dalam satu tempat.',
    },
    {
        q: 'Siapa yang bisa menggunakan Collabite?',
        a: 'Collabite ditujukan untuk pemilik UMKM atau bisnis yang membutuhkan konten promosi, serta content creator yang ingin menemukan peluang kolaborasi.',
    },
    {
        q: 'Apakah creator harus memiliki banyak followers?',
        a: 'Tidak. Collabite terbuka untuk creator micro dan nano. Yang terpenting adalah kualitas konten, portofolio, dan kecocokan dengan kebutuhan campaign, bukan jumlah followers.',
    },
    {
        q: 'Bagaimana cara UMKM memilih creator?',
        a: 'UMKM dapat mencari creator berdasarkan kategori konten, portofolio, rating, lokasi, dan riwayat kolaborasi, lalu mengundang creator atau meninjau pengajuan yang masuk.',
    },
    {
        q: 'Bagaimana proses revisi konten dilakukan?',
        a: 'Creator mengunggah draft konten, lalu UMKM dapat melihatnya, meminta revisi dengan catatan, atau langsung menyetujui konten — semuanya tercatat dalam workspace campaign.',
    },
    {
        q: 'Apakah Collabite sudah menyediakan pembayaran atau escrow?',
        a: 'Belum. Pembayaran dan escrow belum menjadi bagian dari MVP Collabite saat ini. Untuk sementara, kesepakatan dan pembayaran diatur langsung antara UMKM dan creator di luar platform.',
    },
    {
        q: 'Apakah pendaftaran Collabite gratis?',
        a: 'Ya. Kamu bisa mendaftar dan mulai menggunakan Collabite secara gratis, tanpa perlu kartu kredit.',
    },
];

function FaqItem({ q, a }: { q: string; a: string }): ReactNode {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b-[3px] border-[var(--neutral-900)] last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-start justify-between gap-4 py-4 text-left text-[0.95rem] font-black text-foreground"
            >
                {q}
                <span
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center border-2 border-[var(--neutral-900)] bg-white shadow-[2px_2px_0_0_var(--neutral-900)] transition-transform',
                        open && 'rotate-45 bg-[var(--brand-secondary)] text-white',
                    )}
                >
                    <Plus className="size-4" />
                </span>
            </button>
            {open ? (
                <p className="pb-4 text-sm font-medium leading-relaxed text-muted-foreground">
                    {a}
                </p>
            ) : null}
        </div>
    );
}

export function FaqSection(): ReactNode {
    return (
        <section
            id="faq"
            className="brutal-section-alt border-y-[3px] border-[var(--neutral-900)] py-16 lg:py-24"
        >
            <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
                <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                    <SectionHeading
                        brutal
                        eyebrow="FAQ"
                        title="Pertanyaan yang Sering Diajukan"
                        align="left"
                    />

                    <div className={`${brutalCard} bg-white px-5 sm:px-7`}>
                        {FAQS.map((item) => (
                            <FaqItem key={item.q} q={item.q} a={item.a} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
