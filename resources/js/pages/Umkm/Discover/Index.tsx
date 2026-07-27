import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { inviteByCampaign } from '@/actions/App/Http/Controllers/Umkm/CollaborationsController';
import { FilterPanel } from '@/components/app/filter-panel';
import { FlashBanner } from '@/components/app/flash-banner';
import { FormErrorSummary } from '@/components/app/form-error-summary';
import { InitialsAvatar } from '@/components/app/initials-avatar';
import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { StatusBadge } from '@/components/app/status-badge';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index as discoverIndex } from '@/routes/umkm/discover';
import { create as umkmCampaignsCreate } from '@/routes/umkm/campaigns';
import { show as publicCreatorShow } from '@/routes/public/creators';

type Category = { id: number; name: string };
type OpenCampaign = { id: number; title: string };

type Creator = {
    id: number;
    user_id: number;
    name: string;
    headline: string | null;
    city: string | null;
    verification_status: string;
    rating_avg: number;
    rating_count: number;
    profile_photo_url: string | null;
    categories: string[];
    skills: string[];
    portfolio_count: number;
    blocked_campaign_ids?: number[];
};

function defaultCampaignId(
    campaigns: OpenCampaign[],
    blockedIds: number[],
): string {
    const available = campaigns.filter((campaign) => !blockedIds.includes(campaign.id));

    if (available.length === 1) {
        return String(available[0].id);
    }

    return '';
}

export default function Index({
    creators,
    categories,
    filters,
    openCampaigns,
    pagination,
}: {
    creators: { data: Creator[] } | Creator[];
    categories: Category[];
    filters: { q: string; category_id: string | null; min_rating: string | null; verified_only: string | null };
    openCampaigns?: OpenCampaign[];
    pagination?: { current_page: number; last_page: number; total: number };
}): ReactNode {
    const flash = usePage().props.status as string | undefined;
    const list = Array.isArray(creators) ? creators : creators.data;
    const campaigns = openCampaigns ?? [];
    const [invitingId, setInvitingId] = useState<number | null>(null);
    const [inviteCampaignId, setInviteCampaignId] = useState<string>('');

    return (
        <>
            <Head title="Cari Creator" />
            <div>
                <PageHeader
                    description="Temukan Creator, lalu undang ke satu campaign terbuka yang Anda pilih. Satu Creator hanya bisa diundang sekali per campaign."
                    title="Cari Content Creator"
                />

                {flash ? (
                    <div className="mt-6">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                {campaigns.length === 0 ? (
                    <div className="mt-6">
                        <FlashBanner message="Belum ada campaign terbuka. Publikasikan campaign dulu sebelum mengundang Creator." />
                        <Button asChild className="mt-3" variant="outline">
                            <Link href={umkmCampaignsCreate().url}>Buat / buka Campaign</Link>
                        </Button>
                    </div>
                ) : null}

                <div className="mt-8">
                    <FilterPanel>
                        <Form
                            {...discoverIndex.form()}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            options={{ preserveState: true }}
                        >
                            {() => (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="q">Kata kunci</Label>
                                        <Input
                                            defaultValue={filters.q ?? ''}
                                            id="q"
                                            name="q"
                                            placeholder="Nama, keahlian, headline"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="category_id">Kategori</Label>
                                        <input
                                            defaultValue={filters.category_id ?? ''}
                                            id="category_id_input"
                                            name="category_id"
                                            type="hidden"
                                        />
                                        <Select
                                            defaultValue={filters.category_id ?? '__all__'}
                                            onValueChange={(v) => {
                                                const el = document.getElementById(
                                                    'category_id_input',
                                                ) as HTMLInputElement | null;

                                                if (el) {
                                                    el.value = v === '__all__' ? '' : v;
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Semua kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__all__">Semua</SelectItem>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="min_rating">Rating minimal</Label>
                                        <Input
                                            defaultValue={filters.min_rating ?? ''}
                                            id="min_rating"
                                            max="5"
                                            min="0"
                                            name="min_rating"
                                            step="0.1"
                                            type="number"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2 pb-1">
                                        <input
                                            className="size-4 rounded border-border"
                                            defaultChecked={filters.verified_only === '1'}
                                            id="verified_only"
                                            name="verified_only"
                                            type="checkbox"
                                            value="1"
                                        />
                                        <Label htmlFor="verified_only">Hanya terverifikasi</Label>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-4">
                                        <Button type="submit">Terapkan filter</Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </FilterPanel>
                </div>

                {list.length === 0 ? (
                    <div className="mt-8">
                        <ListEmptyState
                            action={
                                <Button asChild variant="outline">
                                    <Link href={discoverIndex().url}>Reset pencarian</Link>
                                </Button>
                            }
                            description="Coba ubah filter pencarian Anda."
                            title="Tidak ada Creator yang cocok"
                        />
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((c) => {
                            const blockedIds = c.blocked_campaign_ids ?? [];
                            const availableCampaigns = campaigns.filter(
                                (campaign) => !blockedIds.includes(campaign.id),
                            );
                            const isInviting = invitingId === c.id;
                            const selectedCampaign =
                                inviteCampaignId !== ''
                                    ? campaigns.find((cm) => String(cm.id) === inviteCampaignId)
                                    : null;
                            const selectedIsBlocked =
                                selectedCampaign !== undefined &&
                                selectedCampaign !== null &&
                                blockedIds.includes(selectedCampaign.id);

                            return (
                                <ResourceCard key={c.id}>
                                    <div className="flex items-start gap-3">
                                        <InitialsAvatar
                                            name={c.name ?? 'Creator'}
                                            size="md"
                                            tone="brand"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <Link
                                                    className="truncate font-semibold text-foreground hover:underline"
                                                    href={publicCreatorShow.url({ creatorProfile: c.id })}
                                                >
                                                    {c.name ?? '-'}
                                                </Link>
                                                <span className="text-xs font-medium text-[var(--warning)]">
                                                    ★ {Number(c.rating_avg).toFixed(1)} ({c.rating_count})
                                                </span>
                                            </div>
                                            <p className="line-clamp-1 text-sm text-muted-foreground">
                                                {c.headline ?? 'Tanpa headline'}
                                                {c.city ? ` · ${c.city}` : ''}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {c.verification_status === 'verified' ? (
                                                    <StatusBadge label="Terverifikasi" tone="success" />
                                                ) : (
                                                    <StatusBadge label="Belum terverifikasi" tone="neutral" />
                                                )}
                                                <StatusBadge
                                                    label={`${c.portfolio_count} Portofolio`}
                                                    tone="neutral"
                                                />
                                                {blockedIds.length > 0 ? (
                                                    <StatusBadge
                                                        label={`Sudah terkait ${blockedIds.length} campaign`}
                                                        tone="info"
                                                    />
                                                ) : null}
                                            </div>
                                            {c.skills.length > 0 ? (
                                                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                                    Keahlian: {c.skills.join(', ')}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-3">
                                        {isInviting ? (
                                            availableCampaigns.length === 0 ? (
                                                <div className="space-y-3 border-t-2 border-[var(--neutral-900)] pt-3">
                                                    <p className="text-sm text-muted-foreground">
                                                        Creator ini sudah punya lamaran/undangan aktif di semua
                                                        campaign terbuka Anda. Tidak bisa diundang lagi ke campaign
                                                        yang sama.
                                                    </p>
                                                    <Button
                                                        onClick={() => {
                                                            setInvitingId(null);
                                                            setInviteCampaignId('');
                                                        }}
                                                        size="sm"
                                                        type="button"
                                                        variant="outline"
                                                    >
                                                        Tutup
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Form
                                                    key={`${c.id}-${inviteCampaignId || 'none'}`}
                                                    {...inviteByCampaign.form(
                                                        Number(
                                                            inviteCampaignId !== ''
                                                                ? inviteCampaignId
                                                                : availableCampaigns[0].id,
                                                        ),
                                                    )}
                                                    className="space-y-3 border-t-2 border-[var(--neutral-900)] pt-3"
                                                    options={{ preserveState: true }}
                                                    onSuccess={() => {
                                                        setInvitingId(null);
                                                        setInviteCampaignId('');
                                                    }}
                                                >
                                                    {({ errors, processing }) => (
                                                        <>
                                                            <FormErrorSummary errors={errors} />
                                                            <input
                                                                name="creator_id"
                                                                type="hidden"
                                                                value={c.user_id}
                                                            />
                                                            <input
                                                                name="campaign_id"
                                                                type="hidden"
                                                                value={inviteCampaignId}
                                                            />
                                                            <div className="flex flex-col gap-1.5">
                                                                <Label htmlFor={`invite-campaign-${c.id}`}>
                                                                    Undang ke campaign mana?
                                                                </Label>
                                                                <Select
                                                                    value={inviteCampaignId}
                                                                    onValueChange={(v) => setInviteCampaignId(v)}
                                                                >
                                                                    <SelectTrigger id={`invite-campaign-${c.id}`}>
                                                                        <SelectValue placeholder="Pilih satu campaign…" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {campaigns.map((cm) => {
                                                                            const blocked = blockedIds.includes(cm.id);

                                                                            return (
                                                                                <SelectItem
                                                                                    disabled={blocked}
                                                                                    key={cm.id}
                                                                                    value={String(cm.id)}
                                                                                >
                                                                                    {cm.title}
                                                                                    {blocked ? ' (sudah diundang/melamar)' : ''}
                                                                                </SelectItem>
                                                                            );
                                                                        })}
                                                                    </SelectContent>
                                                                </Select>
                                                                <InputError message={errors.campaign_id} />
                                                                {selectedCampaign && !selectedIsBlocked ? (
                                                                    <p className="text-xs font-medium text-foreground">
                                                                        Undangan akan dikirim untuk:{' '}
                                                                        <span className="font-bold">
                                                                            {selectedCampaign.title}
                                                                        </span>
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Pilih campaign dulu. Creator hanya diundang ke
                                                                        satu campaign per undangan.
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-1.5">
                                                                <Label htmlFor={`invite-message-${c.id}`}>
                                                                    Pesan undangan
                                                                </Label>
                                                                <Textarea
                                                                    id={`invite-message-${c.id}`}
                                                                    name="message"
                                                                    maxLength={2000}
                                                                    placeholder="Ceritakan singkat mengapa Anda mengundang Creator ini..."
                                                                    rows={3}
                                                                />
                                                                <InputError message={errors.message} />
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Button
                                                                    disabled={
                                                                        processing ||
                                                                        !selectedCampaign ||
                                                                        selectedIsBlocked
                                                                    }
                                                                    type="submit"
                                                                >
                                                                    {processing
                                                                        ? 'Mengirim...'
                                                                        : selectedCampaign
                                                                          ? `Kirim undangan ke «${selectedCampaign.title}»`
                                                                          : 'Pilih campaign dulu'}
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        setInvitingId(null);
                                                                        setInviteCampaignId('');
                                                                    }}
                                                                    type="button"
                                                                    variant="outline"
                                                                >
                                                                    Batal
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </Form>
                                            )
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={publicCreatorShow.url({ creatorProfile: c.id })}>
                                                        Lihat Profil
                                                    </Link>
                                                </Button>
                                                <Button
                                                    disabled={campaigns.length === 0}
                                                    onClick={() => {
                                                        setInvitingId(c.id);
                                                        setInviteCampaignId(
                                                            defaultCampaignId(campaigns, blockedIds),
                                                        );
                                                    }}
                                                    size="sm"
                                                >
                                                    Undang Creator
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </ResourceCard>
                            );
                        })}
                    </div>
                )}

                {pagination ? (
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Halaman {pagination.current_page} dari {pagination.last_page} · Total{' '}
                        {pagination.total}
                    </p>
                ) : null}
            </div>
        </>
    );
}
