import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/collabite/logo';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';

export type CollaborationTab =
    | 'overview'
    | 'messages'
    | 'progress'
    | 'content'
    | 'revisions'
    | 'review';

export type CollaborationContext = {
    id: number | string;
    title: string;
    subtitle?: string;
    status?: string;
    statusLabel?: string;
    campaignHref?: string;
    counterpartyLabel?: string;
    counterpartyValue?: string;
    backHref: string;
    backLabel?: string;
};

export type CollaborationWorkspaceLayoutProps = {
    children: ReactNode;
    context: CollaborationContext;
    tabs?: { value: CollaborationTab; label: string; count?: number }[];
    activeTab?: CollaborationTab;
    onTabChange?: (value: CollaborationTab) => void;
    rightSlot?: ReactNode;
};

function isActiveTab(
    value: CollaborationTab,
    current: CollaborationTab | undefined,
): boolean {
    return current === value;
}

export default function CollaborationWorkspaceLayout({
    children,
    context,
    tabs = [],
    activeTab,
    onTabChange,
    rightSlot,
}: CollaborationWorkspaceLayoutProps): ReactNode {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div
            className="flex min-h-screen flex-col bg-background"
            data-testid="collaboration-workspace-layout"
        >
            <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-5 sm:px-8">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        data-testid="collaboration-back"
                    >
                        <Link href={context.backHref} prefetch>
                            <ArrowLeft className="size-4" />
                            {context.backLabel ?? 'Kembali'}
                        </Link>
                    </Button>
                    <Link className="flex items-center gap-2" href="/">
                        <Logo linked={false} />
                    </Link>
                </div>
            </header>
            <main
                className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-6 sm:px-8 lg:py-8"
                data-testid="collaboration-workspace-main"
            >
                <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                {context.title}
                            </h1>
                            {context.subtitle ? (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {context.subtitle}
                                </p>
                            ) : null}
                            {context.counterpartyLabel ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {context.counterpartyLabel}:{' '}
                                    <span className="font-medium text-foreground">
                                        {context.counterpartyValue ?? '-'}
                                    </span>
                                </p>
                            ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                            {context.statusLabel ? (
                                <span data-testid="collaboration-status">
                                    <StatusBadge label={context.statusLabel} tone="info" />
                                </span>
                            ) : null}
                            {rightSlot}
                        </div>
                    </div>
                    {context.campaignHref ? (
                        <div className="mt-3">
                            <Button asChild variant="link" size="sm" className="h-auto px-0">
                                <Link href={context.campaignHref} prefetch>
                                    Lihat campaign
                                </Link>
                            </Button>
                        </div>
                    ) : null}
                </section>
                {tabs.length > 0 ? (
                    <div className="mt-6 border-b border-border" data-testid="collaboration-tabs">
                        <nav
                            className="-mb-px flex flex-wrap gap-1"
                            role="tablist"
                        >
                            {tabs.map((tab) => {
                                const active = isActiveTab(tab.value, activeTab);

                                if (onTabChange) {
                                    return (
                                        <button
                                            key={tab.value}
                                            type="button"
                                            role="tab"
                                            data-testid={`collaboration-tab-${tab.value}`}
                                            data-active={active ? 'true' : 'false'}
                                            onClick={() => onTabChange(tab.value)}
                                            className={cn(
                                                'inline-flex h-10 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                                                active &&
                                                    'border-[var(--brand-primary)] text-[var(--brand-primary)]',
                                            )}
                                        >
                                            <span>{tab.label}</span>
                                            {typeof tab.count === 'number' ? (
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">
                                                    {tab.count}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                }

                                const href =
                                    tab.value === 'overview'
                                        ? toUrl(context.backHref)
                                        : `${toUrl(context.backHref)}#${tab.value}`;

                                return (
                                    <Link
                                        key={tab.value}
                                        href={href}
                                        role="tab"
                                        data-testid={`collaboration-tab-${tab.value}`}
                                        data-active={
                                            isCurrentUrl(href) ? 'true' : 'false'
                                        }
                                        className={cn(
                                            'inline-flex h-10 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                                            isCurrentUrl(href) &&
                                                'border-primary text-foreground',
                                        )}
                                    >
                                        <span>{tab.label}</span>
                                        {typeof tab.count === 'number' ? (
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                {tab.count}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ) : null}
                <div className="mt-6" data-testid="collaboration-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
