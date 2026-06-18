import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { store, update, publish, cancel } from '@/routes/umkm/campaigns';

type Category = { id: number; name: string };

type Deliverable = { title: string; description?: string | null; quantity?: number };

type Campaign = {
    id: number;
    title: string;
    description: string;
    category_id: number;
    budget: string | null;
    deadline: string | null;
    deliverables?: Deliverable[];
} | null;

export default function Form({ campaign, categories }: { campaign: Campaign; categories: Category[] }) {
    const isEdit = campaign !== null;
    const flash = usePage().props.status as string | undefined;
    const [deliverables, setDeliverables] = useState<Deliverable[]>(
        isEdit && campaign?.deliverables ? campaign.deliverables : [{ title: '', description: '', quantity: 1 }],
    );

    const addDeliverable = (): void => {
        setDeliverables((prev) => [...prev, { title: '', description: '', quantity: 1 }]);
    };

    const removeDeliverable = (index: number): void => {
        setDeliverables((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Campaign' : 'Buat Campaign'} />
            <main className="container mx-auto max-w-3xl px-6 py-10">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit Campaign' : 'Buat Campaign Baru'}</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {isEdit ? 'Perbarui detail campaign Anda.' : 'Publikasikan campaign untuk mengundang Creator.'}
                    </p>
                </header>

                {flash ? (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flash}
                    </div>
                ) : null}

                <Form
                    {...(isEdit ? update.form(campaign!.id) : store.form())}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Campaign</CardTitle>
                                <CardDescription>Tentukan judul, deskripsi, dan budget campaign.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Judul</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={isEdit ? campaign!.title : ''}
                                        maxLength={160}
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        rows={5}
                                        defaultValue={isEdit ? campaign!.description : ''}
                                        maxLength={5000}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-1" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="category_id">Kategori</Label>
                                        <input
                                            type="hidden"
                                            name="category_id"
                                            defaultValue={isEdit ? campaign!.category_id : (categories[0]?.id ?? '')}
                                        />
                                        <Select
                                            defaultValue={String(isEdit ? campaign!.category_id : (categories[0]?.id ?? ''))}
                                            onValueChange={(v) => {
                                                const el = document.getElementById('category_id_input') as HTMLInputElement | null;
                                                if (el) el.value = v;
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.category_id} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="budget">Budget (Rp)</Label>
                                        <Input
                                            id="budget"
                                            name="budget"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            defaultValue={isEdit ? (campaign!.budget ?? '') : ''}
                                        />
                                        <InputError message={errors.budget} className="mt-1" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="deadline">Deadline</Label>
                                    <Input
                                        id="id_deadline"
                                        name="deadline"
                                        type="date"
                                        defaultValue={isEdit ? (campaign!.deadline ?? '') : ''}
                                    />
                                    <InputError message={errors.deadline} className="mt-1" />
                                </div>
                            </CardContent>
                            <Separator />
                            <CardHeader>
                                <CardTitle>Deliverable</CardTitle>
                                <CardDescription>Item yang harus dihasilkan Creator.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {deliverables.map((d, index) => (
                                    <div key={index} className="rounded-md border p-3">
                                        <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
                                            <div>
                                                <Label htmlFor={`deliverables.${index}.title`}>Judul</Label>
                                                <Input
                                                    id={`deliverables.${index}.title`}
                                                    name={`deliverables[${index}][title]`}
                                                    defaultValue={d.title}
                                                    maxLength={160}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`deliverables.${index}.quantity`}>Qty</Label>
                                                <Input
                                                    id={`deliverables.${index}.quantity`}
                                                    name={`deliverables[${index}][quantity]`}
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    defaultValue={d.quantity ?? 1}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDeliverable(index)}
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <Label htmlFor={`deliverables.${index}.description`}>Deskripsi</Label>
                                            <Textarea
                                                id={`deliverables.${index}.description`}
                                                name={`deliverables[${index}][description]`}
                                                defaultValue={d.description ?? ''}
                                                rows={2}
                                                maxLength={1000}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addDeliverable}>
                                    + Tambah Deliverable
                                </Button>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href="/umkm/campaigns">Batal</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Campaign'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </Form>

                {isEdit ? (
                    <div className="mt-4 flex gap-2">
                        <Form {...publish.form(campaign!.id)}>
                            {({ processing }) => (
                                <Button type="submit" variant="default" disabled={processing}>
                                    Publikasikan
                                </Button>
                            )}
                        </Form>
                        <Form {...cancel.form(campaign!.id)}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    onClick={(e) => {
                                        if (!confirm('Batalkan campaign ini?')) e.preventDefault();
                                    }}
                                >
                                    Batalkan
                                </Button>
                            )}
                        </Form>
                    </div>
                ) : null}
            </main>
        </>
    );
}
