import type { ReactNode } from 'react';

type AuthFormSectionProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    children: ReactNode;
};

export function AuthFormSection({
    eyebrow,
    title,
    description,
    children,
}: AuthFormSectionProps): ReactNode {
    return (
        <section className="brutal-card overflow-hidden bg-white">
            <div className="border-b-2 border-[var(--neutral-900)] bg-[var(--neutral-100)] px-4 py-3 sm:px-5">
                {eyebrow ? (
                    <span className="inline-block border-2 border-[var(--neutral-900)] bg-[var(--brand-secondary)] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_var(--neutral-900)]">
                        {eyebrow}
                    </span>
                ) : null}
                <h2
                    className={`text-sm font-black uppercase tracking-wide text-foreground ${eyebrow ? 'mt-2' : ''}`}
                >
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5">
                {children}
            </div>
        </section>
    );
}
