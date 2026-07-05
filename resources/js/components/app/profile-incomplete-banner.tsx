import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type ProfileStatus = {
    isComplete: boolean;
    missingFields: string[];
};

type ProfileIncompleteBannerProps = {
    profileStatus?: ProfileStatus;
};

export function ProfileIncompleteBanner({
    profileStatus,
}: ProfileIncompleteBannerProps): ReactNode {
    if (!profileStatus || profileStatus.isComplete) {
        return null;
    }

    return (
        <div
            className="border-2 border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm font-bold text-amber-950 shadow-[2px_2px_0_0_var(--neutral-900)]"
            data-testid="profile-incomplete-banner"
        >
            <p className="font-medium">Lengkapi profil usaha sebelum publikasi campaign</p>
            <p className="mt-1">
                Field yang masih kosong: {profileStatus.missingFields.join(', ')}.
            </p>
            <Button asChild className="mt-3" size="sm" variant="outline">
                <Link href="/umkm/profile">Ke Profil Usaha</Link>
            </Button>
        </div>
    );
}
