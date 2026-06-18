import { Head, Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

export default function CreatorProfile({ creator }: { creator: Creator }) {
    return (
        <>
            <Head title={creator.name ?? 'Profil Creator'} />
            <main className="container mx-auto px-6 py-10">
                <Button asChild variant="ghost" size="sm" className="mb-4">
                    <Link href={creatorsIndex()}>← Kembali ke Direktori</Link>
                </Button>

                <section className="grid gap-6 md:grid-cols-[1fr_2fr]">
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 py-8">
                            <Avatar className="size-24">
                                {creator.profile_photo_url ? (
                                    <AvatarImage src={creator.profile_photo_url} alt={creator.name ?? ''} />
                                ) : null}
                                <AvatarFallback className="text-xl">
                                    {(creator.name ?? 'C').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h1 className="text-xl font-bold">{creator.name ?? 'Creator'}</h1>
                                {creator.headline ? (
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        {creator.headline}
                                    </p>
                                ) : null}
                                {creator.city ? (
                                    <p className="mt-1 text-xs text-slate-500">{creator.city}</p>
                                ) : null}
                                {creator.verification_status === 'verified' ? (
                                    <Badge variant="default" className="mt-2">
                                        Verified
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="text-center text-sm">
                                <p className="font-semibold">{creator.rating_avg.toFixed(1)} / 5</p>
                                <p className="text-xs text-slate-500">dari {creator.rating_count} ulasan</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        <header className="mb-4">
                            <h2 className="text-lg font-semibold">Tentang</h2>
                        </header>
                        {creator.bio ? (
                            <p className="whitespace-pre-line text-slate-700 dark:text-slate-200">{creator.bio}</p>
                        ) : (
                            <p className="text-sm italic text-slate-500">Belum ada bio.</p>
                        )}

                        {creator.categories.length > 0 ? (
                            <>
                                <Separator className="my-4" />
                                <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    Kategori
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                    {creator.categories.map((category) => (
                                        <Badge key={category.id} variant="secondary">
                                            {category.name}
                                        </Badge>
                                    ))}
                                </div>
                            </>
                        ) : null}

                        {creator.skills.length > 0 ? (
                            <>
                                <Separator className="my-4" />
                                <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    Keahlian
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                    {creator.skills.map((skill) => (
                                        <Badge key={skill.id} variant="outline">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </div>
                </section>

                <section className="mt-10">
                    <header className="mb-4">
                        <h2 className="text-lg font-semibold">Portofolio ({creator.portfolio.length})</h2>
                    </header>
                    {creator.portfolio.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-sm text-slate-500">
                                Belum ada item portofolio.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {creator.portfolio.map((item) => (
                                <Card key={item.id}>
                                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-800">
                                        {item.media_url ? (
                                            <img
                                                src={item.media_url}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                                                No media
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                        {item.description ? (
                                            <CardDescription className="line-clamp-3">{item.description}</CardDescription>
                                        ) : null}
                                        {item.external_url ? (
                                            <a
                                                href={item.external_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 text-xs text-slate-500 underline"
                                            >
                                                Tautan eksternal
                                            </a>
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
