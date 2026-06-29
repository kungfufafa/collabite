import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { home } from '@/routes';

type LogoProps = {
    className?: string;
    variant?: 'default' | 'light';
    linked?: boolean;
};

export function Logo({
    className = '',
    variant = 'default',
    linked = true,
}: LogoProps): ReactNode {
    const wordColor = variant === 'light' ? 'text-white' : 'text-foreground';

    const content = (
        <>
            <span
                className="relative inline-flex size-9 items-center justify-center rounded-lg shadow-xs"
                style={{
                    backgroundImage:
                        'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <circle cx="7" cy="7" r="3.2" fill="white" />
                    <circle
                        cx="17"
                        cy="17"
                        r="3.2"
                        fill="white"
                        fillOpacity="0.85"
                    />
                    <path
                        d="M9.2 9.2 14.8 14.8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </span>
            <span
                className={`text-[1.2rem] font-bold tracking-tight ${wordColor}`}
            >
                Collabite
            </span>
        </>
    );

    if (!linked) {
        return (
            <span className={`inline-flex items-center gap-2 ${className}`}>
                {content}
            </span>
        );
    }

    return (
        <Link
            href={home()}
            className={`inline-flex items-center gap-2 ${className}`}
            data-testid="collabite-logo"
        >
            {content}
        </Link>
    );
}
