import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { ListEmptyState } from '@/components/app/list-empty-state';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { StatusBadge } from '@/components/app/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

export default function UmkmProfile({ umkm }: { umkm: Umkm }): ReactNode {
    return (
        <>
            <Head title={umkm.business_name} />
            <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    <SectionPanel title="Profil UMKM">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Avatar className="size-24">
                                {umkm.logo_url ? (
                                    <AvatarImage src={umkm.logo_url} alt={umkm.business_name} />
                                ) : null}
                                <AvatarFallback className="bg-[var(--brand-secondary-soft)] text-xl font-semibold text-[var(--brand-secondary)]">
                                    {umkm.business_name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{umkm.business_name}</h1>
                                <div className="mt-2">
                                    <StatusBadge label={umkm.business_type} tone="info" />
                                </div>
                                {umkm.city ? (
                                    <p className="mt-2 text-sm text-muted-foreground">{umkm.city}</p>
                                ) : null}
                            </div>
                            {umkm.website_url ? (
                                <Button asChild className="w-full" variant="outline" size="sm">
                                    <a href={umkm.website_url} target="_blank" rel="noopener noreferrer">
                                        Kunjungi Website
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                    </SectionPanel>

                    <SectionPanel title="Tentang Usaha">
                        {umkm.description ? (
                            <p className="text-sm text-muted-foreground">{umkm.description}</p>
                        ) : (
                            <p className="text-sm italic text-muted-foreground">Belum ada deskripsi usaha.</p>
                        )}
                        {umkm.address ? (
                            <div className="mt-6 border-t border-border pt-4">
                                <h3 className="text-sm font-semibold text-foreground">Alamat</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{umkm.address}</p>
                            </div>
                        ) : null}
                    </SectionPanel>
                </div>

                <div className="mt-10">
                    <PageHeader
                        title={`Daftar Produk (${umkm.products.length})`}
                        description="Produk aktif yang ditampilkan di halaman publik UMKM."
                        actions={
                            <Button asChild variant="outline" size="sm">
                                <Link href={creatorsIndex()}>Cari Creator untuk Kolaborasi</Link>
                            </Button>
                        }
                    />

                    {umkm.products.length === 0 ? (
                        <div className="mt-8">
                            <ListEmptyState
                                description="UMKM belum mempublikasikan produk aktif."
                                title="Belum ada produk"
                            />
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {umkm.products.map((product) => (
                                <ResourceCard key={product.id} className="overflow-hidden p-0">
                                    <div className="aspect-video w-full overflow-hidden bg-muted">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                                        {product.description ? (
                                            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                                                {product.description}
                                            </p>
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
