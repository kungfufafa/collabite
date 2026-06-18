<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\UpdateCreatorProfileRequest;
use App\Models\CreatorProfile;
use App\Models\User;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function edit(Request $request): Response
    {
        $profile = $this->profileForUser($request->user());

        return Inertia::render('Creator/Profile/Edit', [
            'profile' => $this->serialize($profile),
        ]);
    }

    public function update(UpdateCreatorProfileRequest $request): RedirectResponse
    {
        $profile = $this->profileForUser($request->user());
        $data = $request->validated();

        DB::transaction(function () use ($profile, $data, $request): void {
            $profile->fill([
                'headline' => $data['headline'] ?? null,
                'bio' => $data['bio'] ?? null,
                'city' => $data['city'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
            ]);

            if ($request->hasFile('profile_photo')) {
                $this->files->delete($profile->profile_photo_path, 'public');
                $profile->profile_photo_path = $this->files->storePublic(
                    $request->file('profile_photo'),
                    'creator',
                    $profile->id,
                );
            }

            $profile->save();
        });

        return back()->with('status', 'Profil berhasil diperbarui.');
    }

    private function profileForUser(User $user): CreatorProfile
    {
        return $user->creatorProfile()->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(CreatorProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'headline' => $profile->headline,
            'bio' => $profile->bio,
            'city' => $profile->city,
            'contact_phone' => $profile->contact_phone,
            'contact_email' => $profile->contact_email,
            'verification_status' => $profile->verification_status->value,
            'profile_photo_url' => $this->files->publicUrl($profile->profile_photo_path),
        ];
    }
}
