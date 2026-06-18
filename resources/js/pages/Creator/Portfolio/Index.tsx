import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function Index({ portfolio_items }: Props) {
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
        if (!confirm('Hapus item portofolio ini?')) return;
        router.delete(`/creator/portfolio/${id}`);
    };

    return (
        <>
            <Head title="Portofolio" />
            <main className="container mx-auto max-w-4xl px-6 py-10 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Portofolio</CardTitle>
                        <CardDescription>Unggah karya terbaik dalam format gambar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    required
                                />
                                {form.errors.title && (
                                    <p className="text-sm text-red-600">{form.errors.title}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="external_url">Tautan Eksternal</Label>
                                    <Input
                                        id="external_url"
                                        type="url"
                                        value={form.data.external_url}
                                        onChange={(e) => form.setData('external_url', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="display_order">Urutan</Label>
                                    <Input
                                        id="display_order"
                                        type="number"
                                        min={0}
                                        value={form.data.display_order}
                                        onChange={(e) => form.setData('display_order', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="media">Media</Label>
                                <Input
                                    id="media"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => form.setData('media', e.target.files?.[0] ?? null)}
                                />
                                {form.errors.media && (
                                    <p className="text-sm text-red-600">{form.errors.media}</p>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={form.processing}>
                                    Tambah
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Portofolio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {portfolio_items.length === 0 ? (
                            <p className="text-sm text-slate-500">Belum ada item.</p>
                        ) : (
                            portfolio_items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {item.media_url ? (
                                            <img
                                                src={item.media_url}
                                                alt={item.title}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded bg-slate-200" />
                                        )}
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            {item.external_url && (
                                                <a
                                                    href={item.external_url}
                                                    className="text-xs text-blue-600 hover:underline"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {item.external_url}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => remove(item.id)}>
                                        Hapus
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
