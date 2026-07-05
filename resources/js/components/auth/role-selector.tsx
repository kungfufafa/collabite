import { Check, Megaphone, Store } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type AuthRole = 'umkm' | 'creator';

type RoleOption = {
    id: AuthRole;
    title: string;
    desc: string;
    icon: LucideIcon;
    accent: 'primary' | 'secondary';
};

const ROLES: RoleOption[] = [
    {
        id: 'umkm',
        title: 'UMKM / Bisnis',
        desc: 'Buat campaign & cari creator',
        icon: Store,
        accent: 'primary',
    },
    {
        id: 'creator',
        title: 'Content Creator',
        desc: 'Temukan campaign & bangun portofolio',
        icon: Megaphone,
        accent: 'secondary',
    },
];

type RoleSelectorProps = {
    value: AuthRole;
    onChange: (role: AuthRole) => void;
    label?: string;
};

export function RoleSelector({
    value,
    onChange,
    label = 'Daftar sebagai',
}: RoleSelectorProps): ReactNode {
    return (
        <div>
            <Label className="mb-3 block text-xs font-black uppercase tracking-widest">
                {label}
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {ROLES.map((role) => {
                    const active = value === role.id;
                    const Icon = role.icon;
                    const accentBg =
                        role.accent === 'primary'
                            ? 'bg-[var(--brand-primary)]'
                            : 'bg-[var(--brand-secondary)]';
                    const accentSoft =
                        role.accent === 'primary'
                            ? 'bg-[var(--brand-primary-soft)]'
                            : 'bg-[var(--brand-secondary-soft)]';

                    return (
                        <button
                            key={role.id}
                            type="button"
                            onClick={() => onChange(role.id)}
                            aria-pressed={active}
                            className={cn(
                                'relative border-2 border-[var(--neutral-900)] p-4 text-left shadow-[3px_3px_0_0_var(--neutral-900)] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--neutral-900)]',
                                active ? accentSoft : 'bg-white',
                            )}
                        >
                            {active ? (
                                <span
                                    className={cn(
                                        'absolute right-2 top-2 flex size-5 items-center justify-center border-2 border-[var(--neutral-900)] text-white shadow-[1px_1px_0_0_var(--neutral-900)]',
                                        accentBg,
                                    )}
                                >
                                    <Check className="size-3" />
                                </span>
                            ) : null}
                            <span
                                className={cn(
                                    'flex size-9 items-center justify-center border-2 border-[var(--neutral-900)] shadow-[2px_2px_0_0_var(--neutral-900)]',
                                    active
                                        ? `${accentBg} text-white`
                                        : 'bg-white text-muted-foreground',
                                )}
                            >
                                <Icon className="size-4" />
                            </span>
                            <p className="mt-3 text-sm font-black uppercase tracking-wide text-foreground">
                                {role.title}
                            </p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">
                                {role.desc}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
