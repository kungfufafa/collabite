import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Item = { id: number; name: string; slug: string };

type Props = {
    profile: { id: number; selected_skill_ids: number[]; selected_category_ids: number[] };
    skills: Item[];
    categories: Item[];
};

export default function Edit({ profile, skills, categories }: Props) {
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
            <main className="container mx-auto max-w-4xl px-6 py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Keahlian & Kategori</CardTitle>
                        <CardDescription>
                            Pilih kategori dan skill yang paling sesuai dengan kontenmu. Disimpan otomatis
                            setelah Anda menekan Simpan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-semibold">Kategori</legend>
                                <div className="grid gap-2 md:grid-cols-2">
                                    {categories.map((cat) => {
                                        const checked = form.data.category_ids.includes(cat.id);
                                        return (
                                            <label
                                                key={cat.id}
                                                className="flex cursor-pointer items-center gap-2 rounded border p-2"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggle('category_ids', cat.id)}
                                                />
                                                <span>{cat.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {form.errors.category_ids && (
                                    <p className="text-sm text-red-600">{form.errors.category_ids}</p>
                                )}
                            </fieldset>

                            <fieldset className="space-y-2">
                                <legend className="text-sm font-semibold">Skill</legend>
                                <div className="grid gap-2 md:grid-cols-3">
                                    {skills.map((skill) => {
                                        const checked = form.data.skill_ids.includes(skill.id);
                                        return (
                                            <label
                                                key={skill.id}
                                                className="flex cursor-pointer items-center gap-2 rounded border p-2"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggle('skill_ids', skill.id)}
                                                />
                                                <span>{skill.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {form.errors.skill_ids && (
                                    <p className="text-sm text-red-600">{form.errors.skill_ids}</p>
                                )}
                            </fieldset>

                            <div className="flex items-center justify-end gap-3">
                                <Label className="text-xs text-slate-500">Sinkron di akhir</Label>
                                <Button type="submit" disabled={form.processing}>
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
