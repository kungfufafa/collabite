import { cn } from '@/lib/utils';

export type ProgressProps = React.ComponentProps<'div'> & {
    value?: number;
    max?: number;
};

export function Progress({
    value = 0,
    max = 100,
    className,
    ...props
}: ProgressProps): React.ReactElement {
    const safeValue = Number.isFinite(value) ? value : 0;
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const percent = Math.max(0, Math.min(100, (safeValue / safeMax) * 100));

    return (
        <div
            role="progressbar"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            data-slot="progress"
            className={cn(
                'bg-primary/10 relative h-2 w-full overflow-hidden rounded-full',
                className,
            )}
            {...props}
        >
            <div
                className="bg-primary h-full transition-all"
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}
