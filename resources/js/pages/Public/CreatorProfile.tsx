import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { index as creatorsIndex } from '@/routes/public/creators';

type PortfolioItem = {
    id: number;
    title: string;
    description: string | null;
    media_url: string | null;
    external_url: string | null;
};

type Creator = {
    id: number;
    name: string | null;
    headline: string | null;
    bio: string | null;
    city: string | null;
    rating_avg: number;
    rating_count: number;
    verification_status: string;
    profile_photo_url: string | null;
    categories: { id: number; name: string }[];
    skills: { id: number; name: string }[];
    portfolio: PortfolioItem[];
};

export default function CreatorProfile({ creator }: { creator: Creator }): ReactNode {
    return (
        <>
            <Head title={creator.name ?? 'Profil Creator'} />
            <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
                <Button asChild className="mb-6 -ml-2" variant="ghost" size="sm">
                    <Link href={creatorsIndex()}>
                        <ArrowLeft className="size-4" />
                        Kembali ke Direktori
                    </Link>
                </Button>

                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    <SectionPanel title="Profil Creator">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Avatar className="size-24">
                                {creator.profile_photo_url ? (
                                    <AvatarImage src={creator.profile_photo_url} alt={creator.name ?? ''} />
                                ) : null}
                                <AvatarFallback className="bg-[var(--brand-primary-muted)] text-xl font-semibold text-[var(--brand-primary)]">
                                    {(creator.name ?? 'C').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">
                                    {creator.name ?? 'Creator'}
                                </h1>
                                {creator.headline ? (
                                    <p className="mt-1 text-sm text-muted-foreground">{creator.headline}</p>
                                ) : null}
                                {creator.city ? (
                                    <p className="mt-1 text-xs text-muted-foreground">{creator.city}</p>
                                ) : null}
                            </div>
                            {creator.verification_status === 'verified' ? (
                                <StatusBadge label="Terverifikasi" tone="success" />
                            ) : (
                                <StatusBadge label="Belum terverifikasi" tone="neutral" />
                            )}
                            <div className="w-full border-t border-border pt-4">
                                <p className="text-lg font-semibold text-foreground">
                                    {creator.rating_avg.toFixed(1)} / 5
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    dari {creator.rating_count} ulasan
                                </p>
                            </div>
                        </div>
                    </SectionPanel>

                    <div className="space-y-6">
                        <SectionPanel title="Tentang">
                            {creator.bio ? (
                                <p className="whitespace-pre-line text-sm text-muted-foreground">
                                    {creator.bio}
                                </p>
                            ) : (
                                <p className="text-sm italic text-muted-foreground">Belum ada bio.</p>
                            )}
                        </SectionPanel>

                        {creator.categories.length > 0 ? (
                            <SectionPanel title="Kategori">
                                <div className="flex flex-wrap gap-2">
                                    {creator.categories.map((category) => (
                                        <StatusBadge key={category.id} label={category.name} tone="neutral" />
                                    ))}
                                </div>
                            </SectionPanel>
                        ) : null}

                        {creator.skills.length > 0 ? (
                            <SectionPanel title="Keahlian">
                                <div className="flex flex-wrap gap-2">
                                    {creator.skills.map((skill) => (
                                        <StatusBadge key={skill.id} label={skill.name} tone="info" />
                                    ))}
                                </div>
                            </SectionPanel>
                        ) : null}
                    </div>
                </div>

                <div className="mt-10">
                    <PageHeader
                        title={`Portofolio (${creator.portfolio.length})`}
                        description="Contoh karya dan deliverable dari Creator ini."
                    />

                    {creator.portfolio.length === 0 ? (
                        <div className="mt-8">
                            <ListEmptyState
                                description="Creator belum menambahkan item portofolio."
                                title="Belum ada portofolio"
                            />
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {creator.portfolio.map((item) => (
                                <ResourceCard key={item.id} className="overflow-hidden p-0">
                                    <div className="aspect-video w-full overflow-hidden bg-muted">
                                        {item.media_url ? (
                                            <img
                                                src={item.media_url}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                                                No media
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                                        {item.description ? (
                                            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        ) : null}
                                        {item.external_url ? (
                                            <a
                                                href={item.external_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-block text-xs text-primary hover:underline"
                                            >
                                                Tautan eksternal
                                            </a>
                                        ) : null}
                                    </div>
                                </ResourceCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
