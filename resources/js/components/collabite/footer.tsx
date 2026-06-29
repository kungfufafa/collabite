import { Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/collabite/logo';

const COLUMNS = [
    {
        title: 'Produk',
        links: [
            { label: 'Cara Kerja', href: '#cara-kerja' },
            { label: 'Fitur', href: '#fitur' },
            { label: 'Untuk UMKM', href: '#umkm' },
            { label: 'Untuk Creator', href: '#creator' },
        ],
    },
    {
        title: 'Dukungan',
        links: [
            { label: 'FAQ', href: '#faq' },
            { label: 'Hubungi Kami', href: '#' },
            { label: 'Panduan', href: '#' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Kebijakan Privasi', href: '#' },
            { label: 'Syarat dan Ketentuan', href: '#' },
        ],
    },
];

const SOCIALS = [Instagram, Twitter, Linkedin, Youtube];

export function Footer(): ReactNode {
    return (
        <footer
            className="border-t border-border bg-white"
            data-testid="public-footer"
        >
            <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div className="max-w-xs">
                        <Logo />
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
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
                                    className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-sm font-semibold text-foreground">
                                {col.title}
                            </h4>
                            <ul className="mt-4 space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 border-t border-border pt-6">
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Collabite. Seluruh hak
                        dilindungi.
                    </p>
                </div>
            </div>
        </footer>
    );
}
