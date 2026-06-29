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
            <span className="relative inline-flex size-9 items-center justify-center">
                <svg
                    viewBox="104 346 280 280"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-full"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="blueGradLogo" x1="109" y1="390" x2="299" y2="580" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#008DF2" />
                            <stop offset="60%" stopColor="#0063D1" />
                            <stop offset="100%" stopColor="#004A9E" />
                        </linearGradient>
                        <linearGradient id="orangeGradLogo" x1="250" y1="410" x2="360" y2="560" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#FA7D1E" />
                            <stop offset="50%" stopColor="#FA5A15" />
                            <stop offset="100%" stopColor="#E83C0C" />
                        </linearGradient>
                        <mask id="lightBlueMaskLogo" maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="1024" height="1024" fill="white" />
                            <circle cx="210" cy="485" r="44" fill="black" />
                            <circle cx="305" cy="485" r="85" fill="black" />
                            <circle cx="216" cy="484" r="78" fill="black" />
                        </mask>
                        <mask id="blueMaskLogo" maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="1024" height="1024" fill="white" />
                            <circle cx="210" cy="485" r="44" fill="black" />
                            <circle cx="305" cy="485" r="85" fill="black" />
                        </mask>
                        <mask id="orangeMaskLogo" maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="1024" height="1024" fill="white" />
                            <circle cx="225" cy="487" r="54" fill="black" />
                        </mask>
                    </defs>
                    <circle
                        cx="210"
                        cy="485"
                        r="92"
                        fill={variant === 'light' ? 'currentColor' : '#0052B3'}
                        mask="url(#blueMaskLogo)"
                        className={variant === 'light' ? 'text-white' : ''}
                    />
                    <circle
                        cx="210"
                        cy="485"
                        r="92"
                        fill={variant === 'light' ? 'currentColor' : 'url(#blueGradLogo)'}
                        mask="url(#lightBlueMaskLogo)"
                        className={variant === 'light' ? 'text-white' : ''}
                    />
                    <path
                        fill={variant === 'light' ? 'currentColor' : 'url(#orangeGradLogo)'}
                        mask="url(#orangeMaskLogo)"
                        className={variant === 'light' ? 'text-white' : ''}
                        d="
                            M 270.1,413.6
                            L 363.2,478.4
                            C 369.6,481.7 369.6,490.3 363.2,493.6
                            L 274.4,558.4
                            C 269.1,561.6 268.0,557.3 268.0,551.9
                            L 264.8,420.1
                            C 264.8,414.7 266.9,411.5 270.1,413.6 Z
                        "
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
