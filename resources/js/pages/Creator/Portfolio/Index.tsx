import { Head, useForm, router } from '@inertiajs/react';
import type { FormEventHandler, ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type PortfolioItem = {
    id: number;
    title: string;
    description: string | null;
    external_url: string | null;
    media_url: string | null;
    display_order: number;
};

type Props = { portfolio_items: PortfolioItem[] };

export default function Index({ portfolio_items }: Props): ReactNode {
    const form = useForm({
        title: '',
        description: '',
        external_url: '',
        media: null as File | null,
        display_order: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/creator/portfolio', {
            forceFormData: true,
            onSuccess: () => form.reset(),
        });
    };

    const remove = (id: number): void => {
        if (!confirm('Hapus item portofolio ini?')) {
            return;
        }

        router.delete(`/creator/portfolio/${id}`);
    };

    return (
        <>
            <Head title="Portofolio" />
            <div>
                <PageHeader
                    description="Unggah karya terbaik untuk menarik undangan UMKM."
                    title="Portofolio"
                />

                <div className="mt-8">
                    <SectionPanel
                        description="Unggah karya terbaik dalam format gambar."
                        title="Tambah Portofolio"
                    >
                        <form className="space-y-4" onSubmit={submit}>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    required
                                    value={form.data.title}
                                />
                                {form.errors.title ? (
                                    <p className="text-sm text-[var(--danger)]">{form.errors.title}</p>
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    value={form.data.description}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="external_url">Tautan Eksternal</Label>
                                    <Input
                                        id="external_url"
                                        onChange={(e) => form.setData('external_url', e.target.value)}
                                        type="url"
                                        value={form.data.external_url}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="display_order">Urutan</Label>
                                    <Input
                                        id="display_order"
                                        min={0}
                                        onChange={(e) => form.setData('display_order', Number(e.target.value))}
                                        type="number"
                                        value={form.data.display_order}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="media">Media</Label>
                                <Input
                                    accept="image/*"
                                    id="media"
                                    onChange={(e) => form.setData('media', e.target.files?.[0] ?? null)}
                                    type="file"
                                />
                                {form.errors.media ? (
                                    <p className="text-sm text-[var(--danger)]">{form.errors.media}</p>
                                ) : null}
                            </div>
                            <div className="flex justify-end">
                                <Button disabled={form.processing} type="submit">
                                    Tambah
                                </Button>
                            </div>
                        </form>
                    </SectionPanel>
                </div>

                <div className="mt-8">
                    <SectionPanel title="Daftar Portofolio">
                        {portfolio_items.length === 0 ? (
                            <ListEmptyState
                                description="Tambahkan minimal satu karya agar profilmu lebih menarik."
                                title="Belum ada item portofolio"
                            />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {portfolio_items.map((item) => (
                                    <ResourceCard
                                        className="flex items-center justify-between gap-4"
                                        key={item.id}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.media_url ? (
                                                <img
                                                    alt={item.title}
                                                    className="size-12 rounded-md object-cover"
                                                    src={item.media_url}
                                                />
                                            ) : (
                                                <div className="size-12 rounded-md bg-muted" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {item.title}
                                                </p>
                                                {item.external_url ? (
                                                    <a
                                                        className="text-xs text-[var(--brand-primary-hover)] hover:underline"
                                                        href={item.external_url}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        {item.external_url}
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => remove(item.id)}
                                            size="sm"
                                            variant="destructive"
                                        >
                                            Hapus
                                        </Button>
                                    </ResourceCard>
                                ))}
                            </div>
                        )}
                    </SectionPanel>
                </div>
            </div>
        </>
    );
}
