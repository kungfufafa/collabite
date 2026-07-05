import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/collabite/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { privacy, terms } from '@/routes/public';

export type Auth5LayoutProps = {
    children: ReactNode;
    title: string;
    description: string;
    quote: string;
    quoteAuthor: string;
    contentWidth?: 'md' | 'xl';
    contentVariant?: 'card' | 'flush';
};

const WIDTH_CLASS = {
    md: 'max-w-md',
    xl: 'max-w-3xl',
} as const;

export function Auth5Layout({
    children,
    title,
    description,
    quote,
    quoteAuthor,
    contentWidth = 'md',
    contentVariant = 'card',
}: Auth5LayoutProps): ReactNode {
    return (
        <main
            className="relative lg:grid lg:min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
            data-testid="auth-5-layout"
        >
            <div className="relative hidden h-full flex-col border-r-[3px] border-[var(--neutral-900)] bg-[var(--brand-primary)] p-10 text-white lg:flex">
                <Logo linked={false} variant="light" className="mr-auto" />

                <div className="my-auto max-w-sm">
                    <p className="inline-block border-2 border-white/80 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-widest text-white">
                        Gratis • Tanpa kartu kredit
                    </p>
                    <blockquote className="mt-6 flex flex-col gap-3">
                        <p className="text-2xl font-black uppercase leading-tight tracking-tight">
                            &ldquo;{quote}&rdquo;
                        </p>
                        <footer className="text-sm font-bold uppercase tracking-wide text-white/80">
                            ~ {quoteAuthor}
                        </footer>
                    </blockquote>
                </div>

                <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-10 right-10 size-20 border-[6px] border-[var(--brand-secondary)]"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute top-24 right-16 size-12 bg-[var(--brand-secondary)]"
                    style={{ boxShadow: '4px 4px 0 0 var(--neutral-900)' }}
                />
            </div>

            <div className="relative flex min-h-svh flex-col bg-[var(--neutral-50)] px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
                <Button
                    asChild
                    className="absolute top-6 left-5 lg:top-7"
                    variant="outline"
                    size="sm"
                >
                    <Link href={home()} prefetch>
                        <ChevronLeft className="size-4" data-icon="inline-start" />
                        Beranda
                    </Link>
                </Button>

                <div
                    className={cn(
                        'mx-auto flex w-full flex-col gap-6 pt-10 lg:pt-4',
                        WIDTH_CLASS[contentWidth],
                    )}
                >
                    <Logo linked={false} className="lg:hidden" />

                    <div className="flex flex-col gap-2">
                        <h1 className="brutal-heading-display text-2xl text-foreground sm:text-[2rem]">
                            {title}
                        </h1>
                        <p className="max-w-2xl text-base font-medium text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {contentVariant === 'card' ? (
                        <div className="brutal-surface bg-white p-5 sm:p-6">
                            {children}
                        </div>
                    ) : (
                        children
                    )}

                    <p className="text-center text-sm font-medium text-muted-foreground lg:text-left">
                        Dengan melanjutkan, Anda setuju dengan{' '}
                        <Link
                            href={terms()}
                            className="font-bold underline underline-offset-4 hover:text-primary"
                        >
                            Syarat dan Ketentuan
                        </Link>{' '}
                        dan{' '}
                        <Link
                            href={privacy()}
                            className="font-bold underline underline-offset-4 hover:text-primary"
                        >
                            Kebijakan Privasi
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}
