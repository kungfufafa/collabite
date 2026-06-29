import type { ReactNode } from 'react';

import { Footer } from '@/components/collabite/footer';
import { Navbar } from '@/components/collabite/navbar';

export type PublicLayoutProps = {
    children: ReactNode;
    hideFooter?: boolean;
};

export default function PublicLayout({
    children,
    hideFooter = false,
}: PublicLayoutProps): ReactNode {
    return (
        <div
            className="min-h-screen bg-background text-foreground"
            data-testid="public-layout"
        >
            <Navbar />
            <main data-testid="public-main">{children}</main>
            {hideFooter ? null : <Footer />}
        </div>
    );
}
