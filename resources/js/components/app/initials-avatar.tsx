type InitialsAvatarProps = {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    tone?: 'brand' | 'secondary' | 'neutral';
    className?: string;
};

const SIZES = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
};

const TONES = {
    brand: 'bg-[var(--brand-primary-muted)] text-[var(--brand-primary)]',
    secondary:
        'bg-[var(--brand-secondary-muted)] text-[var(--brand-secondary)]',
    neutral: 'bg-[var(--neutral-200)] text-[var(--neutral-700)]',
};

function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).slice(0, 2);

    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function InitialsAvatar({
    name,
    size = 'md',
    tone = 'brand',
    className = '',
}: InitialsAvatarProps): React.ReactElement {
    return (
        <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${SIZES[size]} ${TONES[tone]} ${className}`}
        >
            {initialsOf(name)}
        </span>
    );
}
