import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/collabite/logo';
import { FloatingPaths } from '@/components/floating-paths';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

export type Auth5LayoutProps = {
    children: ReactNode;
    title: string;
    description: string;
    quote: string;
    quoteAuthor: string;
};

export function Auth5Layout({
    children,
    title,
    description,
    quote,
    quoteAuthor,
}: Auth5LayoutProps): ReactNode {
    return (
        <main
            className="relative lg:grid lg:min-h-svh lg:grid-cols-2"
            data-testid="auth-5-layout"
        >
            <div className="relative hidden h-full flex-col border-r border-border bg-secondary p-10 lg:flex">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
                <Logo linked={false} className="relative z-10 mr-auto" />

                <div className="relative z-10 mt-auto">
                    <blockquote className="flex flex-col gap-2">
                        <p className="text-xl leading-relaxed text-foreground">
                            &ldquo;{quote}&rdquo;
                        </p>
                        <footer className="font-mono text-sm font-semibold text-muted-foreground">
                            ~ {quoteAuthor}
                        </footer>
                    </blockquote>
                </div>

                <div className="absolute inset-0">
                    <FloatingPaths position={1} />
                    <FloatingPaths position={-1} />
                </div>
            </div>

            <div className="relative flex min-h-svh flex-col justify-center overflow-y-auto px-6 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
                >
                    <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
                    <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
                </div>

                <Button
                    asChild
                    className="absolute top-7 left-5"
                    variant="ghost"
                    size="sm"
                >
                    <Link href={home()} prefetch>
                        <ChevronLeft className="size-4" data-icon="inline-start" />
                        Beranda
                    </Link>
                </Button>

                <div className="mx-auto flex w-full max-w-md flex-col gap-6">
                    <Logo linked={false} className="lg:hidden" />

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-wide text-foreground">
                            {title}
                        </h1>
                        <p className="text-base text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {children}

                    <p className="text-sm text-muted-foreground">
                        Dengan melanjutkan, Anda setuju dengan{' '}
                        <span className="underline underline-offset-4 hover:text-primary">
                            Ketentuan Layanan
                        </span>{' '}
                        dan{' '}
                        <span className="underline underline-offset-4 hover:text-primary">
                            Kebijakan Privasi
                        </span>
                        .
                    </p>
                </div>
            </div>
        </main>
    );
}
