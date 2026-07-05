import { Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/collabite/logo';
import {
    PUBLIC_FOOTER_EXPLORE_LINKS,
    PUBLIC_FOOTER_LEGAL_LINKS,
    PUBLIC_FOOTER_PRODUCT_LINKS,
} from '@/config/public-navigation';

const COLUMNS = [
    {
        title: 'Produk',
        links: PUBLIC_FOOTER_PRODUCT_LINKS,
    },
    {
        title: 'Jelajahi',
        links: PUBLIC_FOOTER_EXPLORE_LINKS,
    },
    {
        title: 'Dukungan',
        links: [
            { label: 'FAQ', href: '/#faq' },
            { label: 'Hubungi Kami', href: 'mailto:hello@collabite.my.id' },
            { label: 'Panduan', href: '/#cara-kerja' },
        ],
    },
    {
        title: 'Legal',
        links: PUBLIC_FOOTER_LEGAL_LINKS,
    },
];

const SOCIALS = [Instagram, Twitter, Linkedin, Youtube];

export function Footer(): ReactNode {
    return (
        <footer
            className="border-t-[3px] border-[var(--neutral-900)] bg-[var(--brand-primary)] text-white"
            data-testid="public-footer"
        >
            <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
                    <div className="max-w-xs">
                        <Logo variant="light" />
                        <p className="mt-4 text-sm font-medium leading-relaxed text-white/85">
                            Platform kolaborasi yang menghubungkan UMKM dengan
                            content creator untuk membuat dan mengelola campaign
                            konten promosi.
                        </p>
                        <div className="mt-5 flex gap-2">
                            {SOCIALS.map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    aria-label="Social media"
                                    className="flex size-9 items-center justify-center border-2 border-white/60 text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-sm font-black uppercase tracking-wide text-white">
                                {col.title}
                            </h4>
                            <ul className="mt-4 space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm font-medium text-white/75 transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 border-t-2 border-white/20 pt-6">
                    <p className="text-center text-sm font-medium text-white/75">
                        © {new Date().getFullYear()} Collabite. Seluruh hak
                        dilindungi.
                    </p>
                </div>
            </div>

            <div
                aria-hidden
                className="overflow-hidden border-t-[3px] border-[var(--neutral-900)] bg-[var(--brand-primary-active)] py-2"
            >
                <p className="brutal-footer-logo pointer-events-none select-none text-center text-[clamp(4rem,18vw,12rem)]">
                    Collabite
                </p>
            </div>
        </footer>
    );
}
