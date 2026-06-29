import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Star } from 'lucide-react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/collabite/logo';
import { home } from '@/routes';

type CollabiteAuthLayoutProps = {
    children: ReactNode;
    panelTitle: string;
    panelSubtitle: string;
    points: string[];
};

export function CollabiteAuthLayout({
    children,
    panelTitle,
    panelSubtitle,
    points,
}: CollabiteAuthLayoutProps): ReactNode {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="flex flex-col px-5 py-6 sm:px-10">
                <div className="flex items-center justify-between">
                    <Logo />
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Beranda
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="w-full max-w-sm">{children}</div>
                </div>
            </div>

            <div
                className="relative hidden lg:block"
                style={{
                    backgroundImage:
                        'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                }}
            >
                <div className="flex h-full flex-col justify-center px-12 xl:px-16">
                    <span className="inline-flex w-fit items-center gap-2 rounded-md bg-white/15 px-3 py-1 text-xs font-medium text-white">
                        <Star className="size-3.5 fill-white text-white" />
                        Platform Kolaborasi UMKM &amp; Content Creator
                    </span>

                    <h2 className="mt-6 max-w-md text-[2rem] font-bold leading-tight tracking-tight text-white xl:text-[2.4rem]">
                        {panelTitle}
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-white/85">
                        {panelSubtitle}
                    </p>

                    <ul className="mt-8 space-y-4">
                        {points.map((point) => (
                            <li
                                key={point}
                                className="flex items-start gap-3 text-white"
                            >
                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                                    <CheckCircle2 className="size-4 text-white" />
                                </span>
                                <span className="text-sm text-white/90">
                                    {point}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-10 flex items-center gap-2 text-xs text-white/85">
                        <ShieldCheck className="size-4" />
                        Gratis untuk memulai • Tanpa kartu kredit
                    </div>
                </div>
            </div>
        </div>
    );
}
