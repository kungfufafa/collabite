import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

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
        <div className="border-b last:border-b-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-start justify-between gap-4 py-4 text-left text-[0.95rem] font-medium text-foreground"
            >
                {q}
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                    )}
                />
            </button>
            {open ? (
                <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
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
            className="border-y border-border bg-card py-16 lg:py-24"
        >
            <div className="mx-auto max-w-3xl px-5 sm:px-8">
                <SectionHeading
                    eyebrow="FAQ"
                    title="Pertanyaan yang Sering Diajukan"
                />

                <div className="mt-10 rounded-xl border border-border bg-[var(--neutral-50)] px-5 sm:px-7">
                    {FAQS.map((item) => (
                        <FaqItem key={item.q} q={item.q} a={item.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}
