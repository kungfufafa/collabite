<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\UpdateCreatorSkillsRequest;
use App\Models\Category;
use App\Models\CreatorProfile;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SkillsController extends Controller
{
    public function edit(Request $request): Response
    {
        $profile = $this->profileForUser($request->user());

        $skills = Skill::query()->orderBy('name')->get(['id', 'name', 'slug']);
        $categories = Category::query()->orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('Creator/Skills/Edit', [
            'profile' => [
                'id' => $profile->id,
                'selected_skill_ids' => $profile->skills()->pluck('skills.id')->all(),
                'selected_category_ids' => $profile->categories()->pluck('categories.id')->all(),
            ],
            'skills' => $skills,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateCreatorSkillsRequest $request): RedirectResponse
    {
        $profile = $this->profileForUser($request->user());
        $data = $request->validated();

        DB::transaction(function () use ($profile, $data): void {
            $profile->skills()->sync($data['skill_ids']);
            $profile->categories()->sync($data['category_ids']);
        });

        return back()->with('status', 'Keahlian dan kategori berhasil diperbarui.');
    }

    private function profileForUser(User $user): CreatorProfile
    {
        return $user->creatorProfile()->firstOrFail();
    }
}
