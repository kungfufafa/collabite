import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { index as creatorsIndex } from '@/routes/public/creators';

type Product = {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
};

type Umkm = {
    id: number;
    business_name: string;
    business_type: string;
    description: string | null;
    address: string | null;
    city: string | null;
    website_url: string | null;
    logo_url: string | null;
    products: Product[];
};

export default function UmkmProfile({ umkm }: { umkm: Umkm }) {
    return (
        <>
            <Head title={umkm.business_name} />
            <main className="container mx-auto px-6 py-10">
                <section className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 py-8">
                            <Avatar className="size-24">
                                {umkm.logo_url ? (
                                    <AvatarImage src={umkm.logo_url} alt={umkm.business_name} />
                                ) : null}
                                <AvatarFallback className="text-xl">
                                    {umkm.business_name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h1 className="text-xl font-bold">{umkm.business_name}</h1>
                                <Badge variant="secondary" className="mt-1">
                                    {umkm.business_type}
                                </Badge>
                                {umkm.city ? (
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{umkm.city}</p>
                                ) : null}
                            </div>
                            {umkm.website_url ? (
                                <Button asChild variant="outline" size="sm">
                                    <a href={umkm.website_url} target="_blank" rel="noopener noreferrer">
                                        Kunjungi Website
                                    </a>
                                </Button>
                            ) : null}
                        </CardContent>
                    </Card>

                    <div>
                        <header className="mb-4">
                            <h2 className="text-lg font-semibold">Tentang Usaha</h2>
                        </header>
                        {umkm.description ? (
                            <p className="text-slate-700 dark:text-slate-200">{umkm.description}</p>
                        ) : (
                            <p className="text-sm italic text-slate-500">Belum ada deskripsi usaha.</p>
                        )}
                        {umkm.address ? (
                            <>
                                <Separator className="my-4" />
                                <h3 className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Alamat</h3>
                                <p className="text-sm">{umkm.address}</p>
                            </>
                        ) : null}
                    </div>
                </section>

                <section className="mt-10">
                    <header className="mb-4 flex items-end justify-between">
                        <h2 className="text-lg font-semibold">Daftar Produk ({umkm.products.length})</h2>
                        <Button asChild variant="link" size="sm">
                            <Link href={creatorsIndex()}>Cari Creator untuk Kolaborasi</Link>
                        </Button>
                    </header>
                    {umkm.products.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-sm text-slate-500">
                                Belum ada produk aktif yang ditampilkan.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {umkm.products.map((product) => (
                                <Card key={product.id}>
                                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-800">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-base">{product.name}</CardTitle>
                                        {product.description ? (
                                            <CardDescription className="line-clamp-3">{product.description}</CardDescription>
                                        ) : null}
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
