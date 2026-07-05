import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';

type WorkspacePageProps = {
    title: string;
    eyebrow?: string;
    description?: string;
    actions?: ReactNode;
    meta?: ReactNode;
    titleUppercase?: boolean;
    children: ReactNode;
    testId?: string;
};

export function WorkspacePage({
    title,
    eyebrow,
    description,
    actions,
    meta,
    titleUppercase,
    children,
    testId,
}: WorkspacePageProps): ReactNode {
    const content = testId ? (
        <div className="flex min-w-0 flex-col gap-8" data-testid={testId}>
            {children}
        </div>
    ) : (
        <div className="flex min-w-0 flex-col gap-8">{children}</div>
    );

    return (
        <>
            <PageHeader
                actions={actions}
                description={description}
                eyebrow={eyebrow}
                meta={meta}
                title={title}
                titleUppercase={titleUppercase}
            />
            {content}
        </>
    );
}

type PageBackButtonProps = {
    href: string;
    label?: string;
};

export function PageBackButton({
    href,
    label = 'Kembali',
}: PageBackButtonProps): ReactNode {
    return (
        <Button asChild size="sm" variant="outline">
            <Link href={href} prefetch>
                <ArrowLeft className="size-4" />
                {label}
            </Link>
        </Button>
    );
}
