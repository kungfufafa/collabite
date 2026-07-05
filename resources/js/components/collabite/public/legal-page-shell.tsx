import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { brutalBtnOutline, brutalPanel } from '@/components/collabite/landing/brutal-styles';
import { SectionHeading } from '@/components/collabite/section-heading';
import type { LegalDocument } from '@/content/legal/types';
import { cn } from '@/lib/utils';

type LegalPageShellProps = {
    document: LegalDocument;
    relatedLink?: {
        label: string;
        href: string;
    };
};

export function LegalPageShell({
    document,
    relatedLink,
}: LegalPageShellProps): ReactNode {
    return (
        <section
            className="landing-brutal border-b-[3px] border-[var(--neutral-900)] bg-[var(--neutral-50)] py-14 sm:py-16"
            data-testid="legal-page"
        >
            <div className="mx-auto max-w-3xl px-5 sm:px-8">
                <Link
                    href="/"
                    className={cn(brutalBtnOutline, 'mb-8 h-10 px-4 text-xs')}
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Beranda
                </Link>

                <SectionHeading
                    eyebrow="Legal"
                    title={document.title}
                    description={document.description}
                    align="left"
                    brutal
                />

                <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Terakhir diperbarui: {document.lastUpdated}
                </p>

                <div className={cn(brutalPanel, 'mt-8 space-y-8 bg-white p-6 sm:p-8')}>
                    {document.sections.map((section) => (
                        <article
                            key={section.id}
                            id={section.id}
                            className="scroll-mt-24"
                        >
                            <h2 className="text-lg font-black uppercase tracking-wide text-foreground">
                                {section.title}
                            </h2>
                            <div className="mt-3 space-y-3 text-sm font-medium leading-relaxed text-muted-foreground">
                                {section.paragraphs.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                                {section.listItems ? (
                                    <ul className="list-disc space-y-2 pl-5">
                                        {section.listItems.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>

                {relatedLink ? (
                    <p className="mt-6 text-sm font-medium text-muted-foreground">
                        Lihat juga:{' '}
                        <Link
                            href={relatedLink.href}
                            className="font-bold text-[var(--brand-primary)] underline underline-offset-4 hover:text-[var(--brand-primary-active)]"
                        >
                            {relatedLink.label}
                        </Link>
                    </p>
                ) : null}
            </div>
        </section>
    );
}
