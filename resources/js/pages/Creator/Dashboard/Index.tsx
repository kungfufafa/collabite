import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Compass,
    Handshake,
    Images,
    Plus,
    Search,
    Star,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { ActivityTimeline } from '@/components/app/activity-timeline';
import { DashboardSection } from '@/components/app/dashboard-section';
import { MetricTile } from '@/components/app/metric-tile';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import type {
    DashboardActivityItem,
    DashboardHealth,
    DashboardStat,
    DashboardTableRow,
} from '@/components/dashboard/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress-placeholder';
import { index as creatorCampaignsIndex } from '@/routes/creator/campaigns';
import { index as creatorCollaborationsIndex } from '@/routes/creator/collaborations';
import { index as creatorPortfolioIndex } from '@/routes/creator/portfolio';
import { show as creatorVerificationShow } from '@/routes/creator/verification';

type Profile = {
    headline: string | null;
    verification_status: string;
    name?: string | null;
};

type PortfolioCompletion = {
    percent: number;
    missing: string[];
};

type Props = {
    stats: DashboardStat[];
    profile: Profile | null;
    portfolio_completion?: PortfolioCompletion;
    recent_collaborations: DashboardTableRow[];
    activity: DashboardActivityItem[];
    health: DashboardHealth;
};

function statValue(stats: DashboardStat[], label: string): string {
    return stats.find((item) => item.label === label)?.value ?? '0';
}

function verificationTone(
    status: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
    if (status === 'verified') {
        return 'success';
    }

    if (status === 'rejected') {
        return 'danger';
    }

    if (status === 'pending') {
        return 'warning';
    }

    return 'neutral';
}

function verificationLabel(status: string): string {
    if (status === 'verified') {
        return 'Terverifikasi';
    }

    if (status === 'rejected') {
        return 'Ditolak';
    }

    if (status === 'pending') {
        return 'Menunggu review';
    }

    return 'Belum diverifikasi';
}

export default function CreatorDashboard({
    stats,
    profile,
    portfolio_completion,
    recent_collaborations,
    activity,
    health,
}: Props): ReactNode {
    const displayName = profile?.name ?? 'Creator';
    const portfolioPercent = portfolio_completion?.percent ?? 0;

    return (
        <>
            <Head title="Dashboard Creator" />
            <div data-testid="creator-home">
                <PageHeader
                    title={`Halo, ${displayName}`}
                    description={
                        profile?.headline ??
                        'Pantau kolaborasi, lengkapi profil, dan temukan campaign yang cocok.'
                    }
                    actions={
                        <Button asChild>
                            <Link href={creatorCampaignsIndex().url}>
                                <Search className="size-4" />
                                Cari Campaign
                            </Link>
                        </Button>
                    }
                />

                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <MetricTile
                        emphasis={Number(statValue(stats, 'Undangan menunggu')) > 0}
                        hint="Sedang berjalan"
                        href={creatorCollaborationsIndex().url}
                        icon={Handshake}
                        label="Kolaborasi aktif"
                        value={statValue(stats, 'Kolaborasi aktif')}
                    />
                    <MetricTile
                        hint="Tampilkan karyamu"
                        href={creatorPortfolioIndex().url}
                        icon={Images}
                        label="Item portofolio"
                        value={statValue(stats, 'Item portofolio')}
                    />
                    <MetricTile
                        hint="Dari ulasan UMKM"
                        href={creatorCollaborationsIndex().url}
                        icon={Star}
                        label="Rating rata-rata"
                        value={statValue(stats, 'Rating rata-rata')}
                    />
                    <MetricTile
                        hint="Peluang terbaru"
                        href={creatorCampaignsIndex().url}
                        icon={Compass}
                        label="Cari campaign"
                        value="→"
                    />
                </div>

                {!health.caught_up ? (
                    <div className="mt-8">
                        <DashboardSection title="Butuh tindakanmu">
                            <ResourceCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <StatusBadge label="Perlu perhatian" tone="warning" />
                                    <p className="mt-2 text-sm text-foreground">
                                        {health.message}
                                    </p>
                                </div>
                                <Button asChild className="shrink-0" variant="outline">
                                    <Link href={creatorPortfolioIndex().url}>
                                        Lengkapi profil
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </ResourceCard>
                        </DashboardSection>
                    </div>
                ) : null}

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <DashboardSection
                            action={{
                                href: creatorCollaborationsIndex().url,
                                label: 'Lihat semua',
                            }}
                            title="Kolaborasi terbaru"
                        >
                            {recent_collaborations.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada kolaborasi. Mulai dengan mencari campaign.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {recent_collaborations.map((row) => (
                                        <ResourceCard key={row.id}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground">
                                                        {row.title}
                                                    </p>
                                                    {row.meta ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            {row.meta}
                                                        </p>
                                                    ) : null}
                                                </div>
                                                {row.status ? (
                                                    <StatusBadge
                                                        label={row.status}
                                                        tone="info"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="mt-3">
                                                <Button asChild size="sm" variant="ghost">
                                                    <Link href={row.href}>
                                                        Buka kolaborasi
                                                    </Link>
                                                </Button>
                                            </div>
                                        </ResourceCard>
                                    ))}
                                </div>
                            )}
                        </DashboardSection>
                    </div>

                    <div className="flex flex-col gap-8">
                        <DashboardSection title="Verifikasi profil">
                            <ResourceCard>
                                <StatusBadge
                                    label={verificationLabel(
                                        profile?.verification_status ?? 'unverified',
                                    )}
                                    tone={verificationTone(
                                        profile?.verification_status ?? 'unverified',
                                    )}
                                />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Profil terverifikasi meningkatkan peluang undangan dari
                                    UMKM.
                                </p>
                                <Button asChild className="mt-4 w-full" variant="outline">
                                    <Link href={creatorVerificationShow().url}>
                                        Lihat status verifikasi
                                    </Link>
                                </Button>
                            </ResourceCard>
                        </DashboardSection>

                        <DashboardSection title="Portofolio">
                            <ResourceCard className="border-dashed">
                                <p className="text-sm font-medium text-foreground">
                                    Lengkapi portofoliomu
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <Progress className="h-2 flex-1" value={portfolioPercent} />
                                    <span className="text-xs tabular-nums text-muted-foreground">
                                        {portfolioPercent}%
                                    </span>
                                </div>
                                <Button asChild className="mt-4 w-full">
                                    <Link href={creatorPortfolioIndex().url}>
                                        <Plus className="size-4" />
                                        Kelola Portofolio
                                    </Link>
                                </Button>
                            </ResourceCard>
                        </DashboardSection>

                        <DashboardSection title="Aktivitas">
                            <ActivityTimeline items={activity} />
                        </DashboardSection>
                    </div>
                </div>
            </div>
        </>
    );
}
