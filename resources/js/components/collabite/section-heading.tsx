import type { ReactNode } from 'react';

type SectionHeadingProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: 'center' | 'left';
    light?: boolean;
    brutal?: boolean;
};

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'center',
    light = false,
    brutal = false,
}: SectionHeadingProps): ReactNode {
    const isCenter = align === 'center';

    return (
        <div
            className={`${isCenter ? 'mx-auto text-center' : 'text-left'} ${brutal ? 'max-w-3xl' : 'max-w-2xl'}`}
        >
            {eyebrow ? (
                <span
                    className={
                        brutal
                            ? `inline-block border-[3px] border-[var(--neutral-900)] px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_0_var(--neutral-900)] ${
                                  light
                                      ? 'bg-white text-[var(--brand-primary-active)]'
                                      : 'bg-[var(--brand-secondary)] text-white'
                              }`
                            : `inline-block text-xs font-semibold uppercase tracking-wide ${
                                  light
                                      ? 'text-[var(--brand-secondary-muted)]'
                                      : 'text-[var(--brand-primary)]'
                              }`
                    }
                >
                    {eyebrow}
                </span>
            ) : null}
            <h2
                className={`mt-4 ${
                    brutal
                        ? 'brutal-heading-display text-[1.85rem] sm:text-[2.35rem] lg:text-[2.75rem]'
                        : 'text-[1.7rem] font-bold leading-tight tracking-tight sm:text-[2.1rem]'
                } ${light ? 'text-white' : 'text-foreground'}`}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={`mt-3 text-base leading-relaxed ${
                        brutal ? 'font-medium' : ''
                    } ${light ? 'text-white/85' : 'text-muted-foreground'}`}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}
