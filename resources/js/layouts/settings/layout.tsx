import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

import { brutalPanelInset } from '@/components/collabite/landing/brutal-styles';
import { PageHeader } from '@/components/app/page-header';
import { Separator } from '@/components/ui/separator';
import { cn, toUrl } from '@/lib/utils';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Keamanan',
        href: '/settings/security',
        icon: null,
    },
    {
        title: 'Tampilan',
        href: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div>
            <PageHeader
                title="Pengaturan"
                description="Kelola profil dan preferensi akun Collabite Anda."
            />

            <div className="mt-8 flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-56">
                    <nav
                        className="flex flex-col gap-2"
                        aria-label="Pengaturan"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentUrl(item.href);

                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'border-2 px-3 py-2.5 text-sm font-bold transition-[transform,box-shadow,background-color]',
                                        active
                                            ? 'border-[var(--neutral-900)] bg-[var(--brand-primary)] text-white shadow-[3px_3px_0_0_var(--neutral-900)]'
                                            : 'border-[var(--neutral-900)] bg-white text-foreground shadow-[2px_2px_0_0_var(--neutral-900)] hover:-translate-x-px hover:-translate-y-px hover:bg-[var(--brand-primary-soft)]',
                                    )}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 border-[var(--neutral-900)] lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className={cn(brutalPanelInset, 'space-y-8 p-5 sm:p-6')}>
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
