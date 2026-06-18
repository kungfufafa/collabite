import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

export default function Index({ products }: { products: Product[] }) {
    const flash = usePage().props.status as string | undefined;
    const [editingId, setEditingId] = useState<number | null>(null);

    const editing = editingId !== null ? products.find((p) => p.id === editingId) ?? null : null;

    return (
        <>
            <Head title="Produk UMKM" />
            <main className="container mx-auto px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Produk UMKM</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Kelola daftar produk Anda. Produk aktif akan tampil di halaman publik UMKM.
                    </p>
                </header>

                {flash ? (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                        {flash}
                    </div>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editing ? 'Edit Produk' : 'Tambah Produk'}</CardTitle>
                            <CardDescription>
                                {editing
                                    ? 'Perbarui informasi produk yang sudah ada.'
                                    : 'Tambahkan produk baru ke katalog Anda.'}
                            </CardDescription>
                        </CardHeader>
                        <Form
                            {...(editing ? updateRoute.form(editing.id) : store.form())}
                            encType="multipart/form-data"
                            resetOnSuccess={!editing}
                            className="contents"
                        >
                            {({ errors, processing, reset }) => (
                                <>
                                    <CardContent className="space-y-4">
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
                                            <p className="mt-1 text-xs text-slate-500">
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
                                                className="size-4 rounded border-slate-300"
                                            />
                                            <Label htmlFor="is_active">Aktif (tampil di halaman publik)</Label>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="justify-end gap-2">
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
                                            {processing ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Produk'}
                                        </Button>
                                    </CardFooter>
                                </>
                            )}
                        </Form>
                    </Card>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold">Daftar Produk ({products.length})</h2>
                        {products.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center text-sm text-slate-500">
                                    Belum ada produk. Tambahkan produk pertama Anda di formulir samping.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <Card key={product.id}>
                                        <CardContent className="flex gap-4 py-4">
                                            <div className="size-20 shrink-0 overflow-hidden rounded-md border bg-slate-100 dark:bg-slate-800">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-semibold">{product.name}</h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </div>
                                                {product.description ? (
                                                    <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                                                        {product.description}
                                                    </p>
                                                ) : null}
                                                <Separator className="my-3" />
                                                <div className="flex justify-end gap-2">
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
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
