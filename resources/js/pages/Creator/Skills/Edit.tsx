import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler, ReactNode } from 'react';

import InputError from '@/components/input-error';
import { PageHeader } from '@/components/app/page-header';
import { SectionPanel } from '@/components/app/section-panel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type Item = { id: number; name: string; slug: string };

type Props = {
    profile: { id: number; selected_skill_ids: number[]; selected_category_ids: number[] };
    skills: Item[];
    categories: Item[];
};

export default function Edit({ profile, skills, categories }: Props): ReactNode {
    const form = useForm({
        skill_ids: profile.selected_skill_ids,
        category_ids: profile.selected_category_ids,
    });

    const toggle = (field: 'skill_ids' | 'category_ids', id: number): void => {
        const current = form.data[field];
        const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
        form.setData(field, next);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.patch('/creator/skills');
    };

    return (
        <>
            <Head title="Keahlian & Kategori" />
            <div>
                <PageHeader
                    title="Keahlian & Kategori"
                    description="Pilih kategori dan skill yang paling sesuai dengan konten Anda."
                />

                <div className="mt-8 max-w-4xl">
                    <SectionPanel title="Preferensi Konten">
                        <form onSubmit={submit} className="space-y-6">
                            <fieldset className="space-y-3">
                                <legend className="text-sm font-semibold text-foreground">Kategori</legend>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {categories.map((cat) => {
                                        const checked = form.data.category_ids.includes(cat.id);

                                        return (
                                            <label
                                                key={cat.id}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggle('category_ids', cat.id)}
                                                />
                                                <span className="text-sm">{cat.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError message={form.errors.category_ids} />
                            </fieldset>

                            <fieldset className="space-y-3">
                                <legend className="text-sm font-semibold text-foreground">Skill</legend>
                                <div className="grid gap-2 md:grid-cols-3">
                                    {skills.map((skill) => {
                                        const checked = form.data.skill_ids.includes(skill.id);

                                        return (
                                            <label
                                                key={skill.id}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggle('skill_ids', skill.id)}
                                                />
                                                <span className="text-sm">{skill.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError message={form.errors.skill_ids} />
                            </fieldset>

                            <div className="flex items-center justify-end">
                                <Button type="submit" disabled={form.processing}>
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </SectionPanel>
                </div>
            </div>
        </>
    );
}
