import { Form as InertiaForm, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { FlashBanner } from '@/components/app/flash-banner';
import { PageHeader } from '@/components/app/page-header';
import { ResourceCard } from '@/components/app/resource-card';
import { SectionPanel } from '@/components/app/section-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

export default function CampaignForm({
    campaign,
    categories,
}: {
    campaign: Campaign;
    categories: Category[];
}): ReactNode {
    const isEdit = campaign !== null;
    const flash = usePage().props.status as string | undefined;
    const [deliverables, setDeliverables] = useState<Deliverable[]>(
        isEdit && campaign?.deliverables
            ? campaign.deliverables
            : [{ title: '', description: '', quantity: 1 }],
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
            <div>
                <PageHeader
                    description={
                        isEdit
                            ? 'Perbarui detail campaign Anda.'
                            : 'Publikasikan campaign untuk mengundang Creator.'
                    }
                    title={isEdit ? 'Edit Campaign' : 'Buat Campaign Baru'}
                />

                {flash ? (
                    <div className="mt-6">
                        <FlashBanner message={flash} />
                    </div>
                ) : null}

                <InertiaForm
                    {...(isEdit ? update.form(campaign!.id) : store.form())}
                    className="mt-8 space-y-8"
                >
                    {({ errors, processing }) => (
                        <>
                            <SectionPanel
                                description="Tentukan judul, deskripsi, dan budget campaign."
                                title="Informasi Campaign"
                            >
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="title">Judul</Label>
                                        <Input
                                            defaultValue={isEdit ? campaign!.title : ''}
                                            id="title"
                                            maxLength={160}
                                            name="title"
                                            required
                                        />
                                        <InputError className="mt-1" message={errors.title} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            defaultValue={isEdit ? campaign!.description : ''}
                                            id="description"
                                            maxLength={5000}
                                            name="description"
                                            required
                                            rows={5}
                                        />
                                        <InputError className="mt-1" message={errors.description} />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="category_id">Kategori</Label>
                                            <input
                                                defaultValue={
                                                    isEdit
                                                        ? campaign!.category_id
                                                        : (categories[0]?.id ?? '')
                                                }
                                                id="category_id_input"
                                                name="category_id"
                                                type="hidden"
                                            />
                                            <Select
                                                defaultValue={String(
                                                    isEdit
                                                        ? campaign!.category_id
                                                        : (categories[0]?.id ?? ''),
                                                )}
                                                onValueChange={(v) => {
                                                    const el = document.getElementById(
                                                        'category_id_input',
                                                    ) as HTMLInputElement | null;

                                                    if (el) {
                                                        el.value = v;
                                                    }
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
                                            <InputError className="mt-1" message={errors.category_id} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="budget">Budget (Rp)</Label>
                                            <Input
                                                defaultValue={isEdit ? (campaign!.budget ?? '') : ''}
                                                id="budget"
                                                min="0"
                                                name="budget"
                                                step="0.01"
                                                type="number"
                                            />
                                            <InputError className="mt-1" message={errors.budget} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="deadline">Deadline</Label>
                                        <Input
                                            defaultValue={isEdit ? (campaign!.deadline ?? '') : ''}
                                            id="deadline"
                                            name="deadline"
                                            type="date"
                                        />
                                        <InputError className="mt-1" message={errors.deadline} />
                                    </div>
                                </div>
                            </SectionPanel>

                            <SectionPanel
                                description="Item yang harus dihasilkan Creator."
                                footer={
                                    <div className="flex justify-end gap-2">
                                        <Button asChild variant="outline">
                                            <Link href="/umkm/campaigns">Batal</Link>
                                        </Button>
                                        <Button disabled={processing} type="submit">
                                            {processing
                                                ? 'Menyimpan...'
                                                : isEdit
                                                  ? 'Simpan Perubahan'
                                                  : 'Buat Campaign'}
                                        </Button>
                                    </div>
                                }
                                title="Deliverable"
                            >
                                <div className="space-y-4">
                                    {deliverables.map((d, index) => (
                                        <ResourceCard key={index}>
                                            <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label htmlFor={`deliverables.${index}.title`}>
                                                        Judul Deliverable
                                                    </Label>
                                                    <Input
                                                        defaultValue={d.title}
                                                        id={`deliverables.${index}.title`}
                                                        maxLength={160}
                                                        name={`deliverables[${index}][title]`}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <Label htmlFor={`deliverables.${index}.quantity`}>
                                                        Qty
                                                    </Label>
                                                    <Input
                                                        defaultValue={d.quantity ?? 1}
                                                        id={`deliverables.${index}.quantity`}
                                                        max="1000"
                                                        min="1"
                                                        name={`deliverables[${index}][quantity]`}
                                                        type="number"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button
                                                        onClick={() => removeDeliverable(index)}
                                                        size="sm"
                                                        type="button"
                                                        variant="ghost"
                                                    >
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-col gap-1.5">
                                                <Label htmlFor={`deliverables.${index}.description`}>
                                                    Deskripsi Deliverable
                                                </Label>
                                                <Textarea
                                                    defaultValue={d.description ?? ''}
                                                    id={`deliverables.${index}.description`}
                                                    maxLength={1000}
                                                    name={`deliverables[${index}][description]`}
                                                    rows={2}
                                                />
                                            </div>
                                        </ResourceCard>
                                    ))}
                                    <Button onClick={addDeliverable} type="button" variant="outline">
                                        + Tambah Deliverable
                                    </Button>
                                </div>
                            </SectionPanel>
                        </>
                    )}
                </InertiaForm>

                {isEdit ? (
                    <div className="mt-4 flex gap-2">
                        <InertiaForm {...publish.form(campaign!.id)}>
                            {({ processing }) => (
                                <Button disabled={processing} type="submit">
                                    Publikasikan
                                </Button>
                            )}
                        </InertiaForm>
                        <InertiaForm {...cancel.form(campaign!.id)}>
                            {({ processing }) => (
                                <Button
                                    disabled={processing}
                                    onClick={(e) => {
                                        if (!confirm('Batalkan campaign ini?')) {
                                            e.preventDefault();
                                        }
                                    }}
                                    type="submit"
                                    variant="destructive"
                                >
                                    Batalkan
                                </Button>
                            )}
                        </InertiaForm>
                    </div>
                ) : null}
            </div>
        </>
    );
}
