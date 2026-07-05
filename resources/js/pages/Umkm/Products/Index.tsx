import { Form, Head, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';

import { FlashBanner } from '@/components/app/flash-banner';
import { FormErrorSummary } from '@/components/app/form-error-summary';
import { PageHeader } from '@/components/app/page-header';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import {
    TableDeleteForm,
    TableRowActions,
} from '@/components/app/table-row-actions';
import { WorkspaceTable } from '@/components/app/workspace-table';
import { brutalThumb } from '@/components/collabite/landing/brutal-styles';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClientTableSearch } from '@/hooks/use-client-table-search';
import { fieldErrorProps } from '@/lib/form-errors';
import { store, update as updateRoute } from '@/routes/umkm/products';

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
    const getSearchText = useCallback(
        (product: Product) => [product.name, product.description ?? '', product.price ?? ''].join(' '),
        [],
    );
    const { query, setQuery, filteredRows, resultCount, totalCount } = useClientTableSearch(
        products,
        getSearchText,
    );

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
                                    <FormErrorSummary errors={errors} />
                                    <div>
                                        <Label htmlFor="name">Nama Produk</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={editing?.name ?? ''}
                                            required
                                            maxLength={160}
                                            {...fieldErrorProps(errors.name)}
                                        />
                                        <InputError message={errors.name} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            defaultValue={editing?.description ?? ''}
                                            maxLength={2000}
                                            rows={3}
                                            className="mt-1"
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
                                            className="size-4 border-2 border-[var(--neutral-900)] shadow-[2px_2px_0_0_var(--neutral-900)]"
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
                        <WorkspaceTable
                            columns={[
                                {
                                    header: 'Produk',
                                    cell: (product) => (
                                        <div className="flex min-w-[14rem] items-center gap-3">
                                            <div className={brutalThumb}>
                                                {product.image_url ? (
                                                    <img
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                        src={product.image_url}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                                        —
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatPrice(product.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    header: 'Deskripsi',
                                    cell: (product) => (
                                        <p className="max-w-xs truncate text-muted-foreground">
                                            {product.description ?? '—'}
                                        </p>
                                    ),
                                },
                                {
                                    header: 'Status',
                                    cell: (product) => (
                                        <StatusBadge
                                            label={product.is_active ? 'Aktif' : 'Nonaktif'}
                                            tone={product.is_active ? 'success' : 'neutral'}
                                        />
                                    ),
                                },
                                {
                                    header: 'Aksi',
                                    className: 'text-right',
                                    cell: (product) => (
                                        <TableRowActions>
                                            <Button
                                                size="sm"
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditingId(product.id)}
                                            >
                                                Edit
                                            </Button>
                                            <TableDeleteForm
                                                action={`/umkm/products/${product.id}`}
                                                confirmMessage="Hapus produk ini?"
                                            />
                                        </TableRowActions>
                                    ),
                                },
                            ]}
                            emptyDescription="Tambahkan produk pertama Anda di formulir samping."
                            emptyTitle="Belum ada produk"
                            getRowKey={(product) => product.id}
                            rows={filteredRows}
                            search={{
                                onChange: setQuery,
                                placeholder: 'Cari nama produk...',
                                resultCount,
                                totalCount,
                                value: query,
                            }}
                        />
                    </section>
                </div>
            </div>
        </>
    );
}
