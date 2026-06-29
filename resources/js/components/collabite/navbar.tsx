import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/collabite/logo';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { login, register } from '@/routes';

const NAV_LINKS = [
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Untuk UMKM', href: '#umkm' },
    { label: 'Untuk Creator', href: '#creator' },
    { label: 'Fitur', href: '#fitur' },
    { label: 'FAQ', href: '#faq' },
];

export function Navbar(): ReactNode {
    const [scrolled, setScrolled] = useState(false);
    const page = usePage();
    const user = page.props.auth?.user;

    useEffect(() => {
        const onScroll = (): void => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all ${
                scrolled
                    ? 'border-b border-border bg-background/85 backdrop-blur-md'
                    : 'border-b border-transparent bg-background/0'
            }`}
            data-testid="public-navbar"
        >
            <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
                <Logo />

                <nav className="hidden items-center gap-7 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 lg:flex">
                    {user ? (
                        <Button asChild>
                            <Link href="/dashboard">Buka Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className="text-foreground">
                                <Link href={login()}>Masuk</Link>
                            </Button>
                            <Button asChild className="shadow-sm">
                                <Link href={register()}>Daftar Gratis</Link>
                            </Button>
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
                                {NAV_LINKS.map((link) => (
                                    <SheetClose asChild key={link.href}>
                                        <a
                                            href={link.href}
                                            className="rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-muted"
                                        >
                                            {link.label}
                                        </a>
                                    </SheetClose>
                                ))}
                            </nav>
                            <div className="mt-auto flex flex-col gap-2 p-5">
                                {user ? (
                                    <SheetClose asChild>
                                        <Button asChild className="w-full">
                                            <Link href="/dashboard">
                                                Buka Dashboard
                                            </Link>
                                        </Button>
                                    </SheetClose>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <Link href={login()}>Masuk</Link>
                                            </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button asChild className="w-full">
                                                <Link href={register()}>
                                                    Daftar Gratis
                                                </Link>
                                            </Button>
                                        </SheetClose>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
