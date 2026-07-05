import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { brutalBtnPrimary } from '@/components/collabite/landing/brutal-styles';
import { Logo } from '@/components/collabite/logo';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { PUBLIC_NAV_LINKS } from '@/config/public-navigation';
import { login, register } from '@/routes';
import type { Auth } from '@/types/auth';

export function Navbar(): ReactNode {
    const [scrolled, setScrolled] = useState(false);
    const page = usePage<{ auth: Auth }>();
    const user = page.props.auth?.user;

    useEffect(() => {
        const onScroll = (): void => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b-[3px] border-[var(--neutral-900)] bg-white/95 backdrop-blur-md transition-all ${
                scrolled ? '' : 'border-b-[3px]'
            }`}
            data-testid="public-navbar"
        >
            <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_1fr] items-center gap-4 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <div className="justify-self-start">
                    <Logo />
                </div>

                <nav
                    aria-label="Navigasi utama"
                    className="hidden items-center justify-center gap-7 lg:flex"
                >
                    {PUBLIC_NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center justify-end gap-2 justify-self-end">
                    <div className="hidden items-center gap-2 lg:flex">
                        {user ? (
                            <Link href="/dashboard" className={brutalBtnPrimary}>
                                Buka Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-[var(--brand-primary)]"
                                >
                                    Masuk
                                </Link>
                                <Link href={register()} className={brutalBtnPrimary}>
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Buka menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[82%] max-w-xs">
                            <SheetTitle className="sr-only">
                                Menu navigasi
                            </SheetTitle>
                            <div className="px-5 pt-5">
                                <Logo />
                            </div>
                            <nav className="mt-4 flex flex-col px-3">
                                {PUBLIC_NAV_LINKS.map((link) => (
                                    <SheetClose asChild key={link.href}>
                                        <a
                                            href={link.href}
                                            className="px-3 py-3 text-sm font-bold text-foreground transition-colors hover:bg-[var(--neutral-100)]"
                                        >
                                            {link.label}
                                        </a>
                                    </SheetClose>
                                ))}
                            </nav>
                            <div className="mt-auto flex flex-col gap-2 p-5">
                                {user ? (
                                    <SheetClose asChild>
                                        <Link
                                            href="/dashboard"
                                            className={`${brutalBtnPrimary} w-full`}
                                        >
                                            Buka Dashboard
                                        </Link>
                                    </SheetClose>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full font-bold"
                                            >
                                                <Link href={login()}>Masuk</Link>
                                            </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href={register()}
                                                className={`${brutalBtnPrimary} w-full`}
                                            >
                                                Daftar
                                            </Link>
                                        </SheetClose>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
