import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { SectionPanel } from '@/components/app/section-panel';
import { useAppearance } from '@/hooks/use-appearance';

export default function Appearance(): ReactNode {
    const { appearance } = useAppearance();

    return (
        <>
            <Head title="Tampilan" />
            <SectionPanel
                title="Tampilan"
                description="Collabite MVP menggunakan tema terang untuk konsistensi antarmuka."
            >
                <p className="text-sm text-muted-foreground">
                    Tema aktif:{' '}
                    <span className="font-medium text-foreground">
                        {appearance === 'light' ? 'Terang' : appearance}
                    </span>
                </p>
            </SectionPanel>
        </>
    );
}
