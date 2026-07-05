import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type OptionChipGridProps = {
    name: string;
    options: { id: number; name: string }[];
    columns?: 2 | 3;
};

export function OptionChipGrid({
    name,
    options,
    columns = 2,
}: OptionChipGridProps): ReactNode {
    return (
        <div
            className={cn(
                'grid gap-2',
                columns === 3
                    ? 'sm:grid-cols-2 lg:grid-cols-3'
                    : 'sm:grid-cols-2',
            )}
        >
            {options.map((option) => (
                <label
                    key={option.id}
                    className="group relative flex cursor-pointer items-center gap-2.5 border-2 border-[var(--neutral-900)] bg-white p-3 text-sm font-bold shadow-[2px_2px_0_0_var(--neutral-900)] transition-[transform,box-shadow,background-color] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--neutral-900)] has-[:checked]:bg-[var(--brand-primary-soft)]"
                >
                    <input
                        className="peer sr-only"
                        name={`${name}[]`}
                        type="checkbox"
                        value={option.id}
                    />
                    <span className="flex size-5 shrink-0 items-center justify-center border-2 border-[var(--neutral-900)] bg-white text-transparent peer-checked:bg-[var(--brand-primary)] peer-checked:text-white">
                        <Check className="size-3" />
                    </span>
                    <span className="text-foreground">{option.name}</span>
                </label>
            ))}
        </div>
    );
}
