import type { ReactNode } from 'react';

type SectionHeadingProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: 'center' | 'left';
    light?: boolean;
};

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'center',
    light = false,
}: SectionHeadingProps): ReactNode {
    const isCenter = align === 'center';

    return (
        <div
            className={`${isCenter ? 'mx-auto text-center' : 'text-left'} max-w-2xl`}
        >
            {eyebrow ? (
                <span
                    className={`inline-block text-xs font-semibold uppercase tracking-wide ${
                        light
                            ? 'text-[var(--brand-secondary-muted)]'
                            : 'text-[var(--brand-primary)]'
                    }`}
                >
                    {eyebrow}
                </span>
            ) : null}
            <h2
                className={`mt-4 text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2.1rem] ${
                    light ? 'text-white' : 'text-foreground'
                }`}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={`mt-3 text-base leading-relaxed ${
                        light ? 'text-white/85' : 'text-muted-foreground'
                    }`}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}
