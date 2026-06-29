import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { FlashBanner } from '@/components/app/flash-banner';
import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update as updateRoute, destroy as destroyRoute } from '@/routes/umkm/products';

type Product = {
    id: number;
    name: string;
    description: string | null;
    price: string | null;
    is_active: boolean;
    image_url: string | null;
};

function formatPrice(value: string | null): string {
    if (value === null || value === '') {
        return '-';
    }

    return 'Rp ' + Number(value).toLocaleString('id-ID');
}

export default function Index({ products }: { products: Product[] }): ReactNode {
    const flash = usePage().props.status as string | undefined;
    const [editingId, setEditingId] = useState<number | null>(null);

    const editing = editingId !== null ? products.find((p) => p.id === editingId) ?? null : null;

    return (
        <>
            <Head title="Produk UMKM" />
            <div>
                <PageHeader
                    title="Produk UMKM"
                    description="Kelola daftar produk Anda. Produk aktif akan tampil di halaman publik UMKM."
                />

                {flash ? (
                    <div className="mt-6">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
                    <Form
                        {...(editing ? updateRoute.form(editing.id) : store.form())}
                        encType="multipart/form-data"
                        resetOnSuccess={!editing}
                    >
                        {({ errors, processing, reset }) => (
                            <SectionPanel
                                title={editing ? 'Edit Produk' : 'Tambah Produk'}
                                description={
                                    editing
                                        ? 'Perbarui informasi produk yang sudah ada.'
                                        : 'Tambahkan produk baru ke katalog Anda.'
                                }
                                footer={
                                    <div className="flex justify-end gap-2">
                                        {editing ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    reset();
                                                }}
                                            >
                                                Batal
                                            </Button>
                                        ) : null}
                                        <Button type="submit" disabled={processing}>
                                            {processing
                                                ? 'Menyimpan...'
                                                : editing
                                                  ? 'Simpan Perubahan'
                                                  : 'Tambah Produk'}
                                        </Button>
                                    </div>
                                }
                            >
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Nama Produk</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={editing?.name ?? ''}
                                            required
                                            maxLength={160}
                                        />
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            defaultValue={editing?.description ?? ''}
                                            maxLength={2000}
                                            rows={3}
                                            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 mt-1 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <InputError message={errors.description} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="price">Harga</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            defaultValue={editing?.price ?? ''}
                                        />
                                        <InputError message={errors.price} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="image">Foto Produk</Label>
                                        <Input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            className="mt-1"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            JPG/PNG/WebP, maksimal 2MB.
                                        </p>
                                        <InputError message={errors.image} className="mt-1" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="is_active"
                                            name="is_active"
                                            type="checkbox"
                                            value="1"
                                            defaultChecked={editing ? editing.is_active : true}
                                            className="size-4 rounded border-border"
                                        />
                                        <Label htmlFor="is_active">Aktif (tampil di halaman publik)</Label>
                                    </div>
                                </div>
                            </SectionPanel>
                        )}
                    </Form>

                    <section>
                        <h2 className="mb-4 text-base font-semibold text-foreground">
                            Daftar Produk ({products.length})
                        </h2>
                        {products.length === 0 ? (
                            <ListEmptyState
                                description="Tambahkan produk pertama Anda di formulir samping."
                                title="Belum ada produk"
                            />
                        ) : (
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <ResourceCard key={product.id}>
                                        <div className="flex gap-4">
                                            <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                    <StatusBadge
                                                        label={product.is_active ? 'Aktif' : 'Nonaktif'}
                                                        tone={product.is_active ? 'success' : 'neutral'}
                                                    />
                                                </div>
                                                {product.description ? (
                                                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                        {product.description}
                                                    </p>
                                                ) : null}
                                                <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingId(product.id)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Form
                                                        {...destroyRoute.form(product.id)}
                                                        options={{ preserveScroll: true }}
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                variant="destructive"
                                                                size="sm"
                                                                disabled={processing}
                                                                onClick={(event) => {
                                                                    if (!confirm('Hapus produk ini?')) {
                                                                        event.preventDefault();
                                                                    }
                                                                }}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        )}
                                                    </Form>
                                                </div>
                                            </div>
                                        </div>
                                    </ResourceCard>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
