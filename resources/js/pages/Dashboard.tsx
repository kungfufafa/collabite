import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';

type Props = {
    role: string;
};

export default function Dashboard({ role }: Props): ReactNode {
    return (
        <>
            <Head title="Dashboard" />
            <PageHeader
                description="Peran akun Anda belum memiliki portal khusus. Hubungi admin jika ini tidak seharusnya terjadi."
                title="Dashboard"
            />
            <p className="text-sm text-muted-foreground">
                Peran terdeteksi: <span className="font-medium">{role}</span>
            </p>
            <Button asChild className="mt-6 w-fit">
                <Link href="/">Kembali ke Beranda</Link>
            </Button>
        </>
    );
}
