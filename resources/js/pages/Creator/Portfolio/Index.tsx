import { Head, useForm, router } from '@inertiajs/react';
import type { FormEventHandler, ReactNode } from 'react';

import { FormErrorSummary } from '@/components/app/form-error-summary';
import { ListEmptyState } from '@/components/app/list-empty-state';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { WorkspacePage } from '@/components/app/workspace-page';
import { brutalThumb } from '@/components/collabite/landing/brutal-styles';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fieldErrorProps } from '@/lib/form-errors';

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
            <WorkspacePage
                description="Unggah karya terbaik untuk menarik undangan UMKM."
                title="Portofolio"
            >
                <SectionPanel title="Tambah Portofolio">
                        <form className="space-y-4" onSubmit={submit}>
                            <FormErrorSummary errors={form.errors} />

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    required
                                    value={form.data.title}
                                    {...fieldErrorProps(form.errors.title)}
                                />
                                <InputError message={form.errors.title} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    value={form.data.description}
                                    {...fieldErrorProps(form.errors.description)}
                                />
                                <InputError message={form.errors.description} />
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
                                    {...fieldErrorProps(form.errors.media)}
                                />
                                <InputError message={form.errors.media} />
                            </div>
                            <div className="flex justify-end">
                                <Button disabled={form.processing} type="submit">
                                    Tambah
                                </Button>
                            </div>
                        </form>
                </SectionPanel>

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
                                                    className={brutalThumb}
                                                    src={item.media_url}
                                                />
                                            ) : (
                                                <div className={brutalThumb} />
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
            </WorkspacePage>
        </>
    );
}
