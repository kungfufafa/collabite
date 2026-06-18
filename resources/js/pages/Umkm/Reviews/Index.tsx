import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Review = {
    id: number;
    rating: number;
    body: string | null;
    reviewer: { id: number; name: string };
    campaign: { id: number; title: string };
    created_at: string;
};

export default function Index({ reviews }: { reviews: { data: Review[] } | Review[] }) {
    const list = Array.isArray(reviews) ? reviews : reviews.data;

    return (
        <>
            <Head title="Review untuk UMKM" />
            <main className="container mx-auto max-w-3xl px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Review</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Review yang diberikan Creator kepada Anda.
                    </p>
                </header>

                {list.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-slate-500">
                            Belum ada review masuk.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {list.map((r) => (
                            <Card key={r.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">
                                                {r.reviewer.name} • ★{r.rating}
                                            </CardTitle>
                                            <CardDescription>
                                                <Link href={`/umkm/campaigns/${r.campaign.id}`} className="hover:underline">
                                                    {r.campaign.title}
                                                </Link>{' '}
                                                • {r.created_at}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline">{r.rating}/5</Badge>
                                    </div>
                                </CardHeader>
                                {r.body ? (
                                    <CardContent>
                                        <p className="text-sm">{r.body}</p>
                                    </CardContent>
                                ) : null}
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}