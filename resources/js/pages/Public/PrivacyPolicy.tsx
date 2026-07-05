import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { LegalPageShell } from '@/components/collabite/public/legal-page-shell';
import { privacyPolicyDocument } from '@/content/legal/privacy-policy';
import { terms } from '@/routes/public';

export default function PrivacyPolicy(): ReactNode {
    return (
        <>
            <Head title="Kebijakan Privasi" />
            <LegalPageShell
                document={privacyPolicyDocument}
                relatedLink={{
                    label: 'Syarat dan Ketentuan',
                    href: terms.url(),
                }}
            />
        </>
    );
}
