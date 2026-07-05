import { Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
                className,
            )}
            {...props}
        >
            <button
                onClick={() => updateAppearance(appearance)}
                className="flex items-center rounded-md bg-white px-3.5 py-1.5 shadow-xs transition-colors dark:bg-neutral-700 dark:text-neutral-100"
            >
                <Sun className="-ml-1 h-4 w-4" />
                <span className="ml-1.5 text-sm">Light</span>
            </button>
        </div>
    );
}
