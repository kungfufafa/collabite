import {
    LayoutList,
    LineChart,
    MessageSquareHeart,
    UserCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { brutalIconBoxMuted } from '@/components/collabite/landing/brutal-styles';

const ITEMS = [
    { icon: UserCheck, label: 'Creator dengan profil dan portofolio' },
    { icon: LayoutList, label: 'Campaign lebih terstruktur' },
    { icon: LineChart, label: 'Progress mudah dipantau' },
    { icon: MessageSquareHeart, label: 'Review dari kolaborasi nyata' },
];

export function TrustStrip(): ReactNode {
    return (
        <section className="border-b-[3px] border-[var(--neutral-900)] bg-[var(--neutral-100)]">
            <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-4 px-5 py-6 sm:px-8 lg:grid-cols-4 lg:py-5">
                {ITEMS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5">
                        <span className={brutalIconBoxMuted}>
                            <Icon className="size-4" />
                        </span>
                        <span className="text-sm font-bold text-muted-foreground">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
