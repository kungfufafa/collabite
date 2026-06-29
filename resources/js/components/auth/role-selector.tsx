import { Check, Megaphone, Store } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';

export type AuthRole = 'umkm' | 'creator';

type RoleOption = {
    id: AuthRole;
    title: string;
    desc: string;
    icon: LucideIcon;
};

const ROLES: RoleOption[] = [
    {
        id: 'umkm',
        title: 'UMKM / Bisnis',
        desc: 'Saya ingin membuat campaign',
        icon: Store,
    },
    {
        id: 'creator',
        title: 'Content Creator',
        desc: 'Saya ingin mengerjakan campaign',
        icon: Megaphone,
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
    label = 'Saya mendaftar sebagai',
}: RoleSelectorProps): ReactNode {
    return (
        <div>
            <Label className="mb-3 block">{label}</Label>
            <div className="grid grid-cols-2 gap-4">
                {ROLES.map((r) => {
                    const active = value === r.id;
                    const Icon = r.icon;

                    return (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => onChange(r.id)}
                            aria-pressed={active}
                            className={`relative rounded-lg border p-4 text-left transition-colors ${
                                active
                                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] ring-1 ring-[var(--brand-primary)]'
                                    : 'border-border bg-background hover:border-[var(--brand-primary-muted)]'
                            }`}
                        >
                            {active ? (
                                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white">
                                    <Check className="size-3" />
                                </span>
                            ) : null}
                            <span
                                className={`flex size-8 items-center justify-center rounded-md ${
                                    active
                                        ? 'bg-[var(--brand-primary)] text-white'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <Icon className="size-4" />
                            </span>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                                {r.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {r.desc}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
