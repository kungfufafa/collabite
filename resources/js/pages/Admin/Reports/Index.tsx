import { Head } from '@inertiajs/react';
import { Activity, Briefcase, Star, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { MetricTile } from '@/components/app/metric-tile';
import { PageHeader } from '@/components/app/page-header';

type Stats = {
    users_total: number;
    umkm_total: number;
    creator_total: number;
    campaigns_total: number;
    campaigns_open: number;
    campaigns_completed: number;
    collaborations_total: number;
    collaborations_active: number;
    reviews_total: number;
    avg_rating: number;
};

type Props = {
    stats: Stats;
};

export default function AdminReportsIndex({ stats }: Props): ReactNode {
    return (
        <>
            <Head title="Laporan" />
            <div>
                <PageHeader
                    description="Ringkasan metrik platform. Ekspor CSV tersedia dari endpoint /admin/reports/export."
                    title="Laporan & Statistik"
                />

                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <MetricTile
                        hint="Seluruh akun"
                        href="/admin/users"
                        icon={Users}
                        label="Total pengguna"
                        value={stats.users_total}
                    />
                    <MetricTile
                        hint="Akun bisnis"
                        href="/admin/users"
                        icon={Users}
                        label="UMKM"
                        value={stats.umkm_total}
                    />
                    <MetricTile
                        hint="Akun creator"
                        href="/admin/users"
                        icon={Users}
                        label="Creator"
                        value={stats.creator_total}
                    />
                    <MetricTile
                        hint={`${stats.campaigns_open} terbuka`}
                        href="/admin/moderation/campaigns"
                        icon={Briefcase}
                        label="Total campaign"
                        value={stats.campaigns_total}
                    />
                    <MetricTile
                        hint={`${stats.collaborations_active} aktif`}
                        href="/admin/collaborations"
                        icon={Activity}
                        label="Kolaborasi"
                        value={stats.collaborations_total}
                    />
                    <MetricTile
                        hint="Campaign selesai"
                        href="/admin/moderation/campaigns"
                        icon={Briefcase}
                        label="Campaign selesai"
                        value={stats.campaigns_completed}
                    />
                    <MetricTile
                        hint="Ulasan platform"
                        href="/admin/moderation/reviews"
                        icon={Star}
                        label="Total review"
                        value={stats.reviews_total}
                    />
                    <MetricTile
                        hint="Rata-rata semua review"
                        href="/admin/moderation/reviews"
                        icon={Star}
                        label="Rating rata-rata"
                        value={stats.avg_rating.toFixed(1)}
                    />
                </div>
            </div>
        </>
    );
}
