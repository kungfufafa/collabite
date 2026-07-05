import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { LegalPageShell } from '@/components/collabite/public/legal-page-shell';
import { termsOfServiceDocument } from '@/content/legal/terms-of-service';
import { privacy } from '@/routes/public';

export default function TermsOfService(): ReactNode {
    return (
        <>
            <Head title="Syarat dan Ketentuan" />
            <LegalPageShell
                document={termsOfServiceDocument}
                relatedLink={{
                    label: 'Kebijakan Privasi',
                    href: privacy.url(),
                }}
            />
        </>
    );
}
