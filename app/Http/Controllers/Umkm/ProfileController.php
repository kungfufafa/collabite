<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\UpdateUmkmProfileRequest;
use App\Models\UmkmProfile;
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

        return Inertia::render('Umkm/Profile/Edit', [
            'profile' => $this->serialize($profile),
        ]);
    }

    public function update(UpdateUmkmProfileRequest $request): RedirectResponse
    {
        $profile = $this->profileForUser($request->user());
        $data = $request->validated();

        DB::transaction(function () use ($profile, $data, $request): void {
            $profile->fill([
                'business_name' => $data['business_name'],
                'business_type' => $data['business_type'],
                'description' => $data['description'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
                'website_url' => $data['website_url'] ?? null,
            ]);

            if ($request->hasFile('logo')) {
                $this->files->delete($profile->logo_path, 'public');
                $profile->logo_path = $this->files->storePublic($request->file('logo'), 'umkm', $profile->id);
            }

            $profile->save();
        });

        return back()->with('status', 'Profil berhasil diperbarui.');
    }

    private function profileForUser(User $user): UmkmProfile
    {
        return $user->umkmProfile()->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(UmkmProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'business_name' => $profile->business_name,
            'business_type' => $profile->business_type,
            'description' => $profile->description,
            'address' => $profile->address,
            'city' => $profile->city,
            'contact_phone' => $profile->contact_phone,
            'contact_email' => $profile->contact_email,
            'website_url' => $profile->website_url,
            'logo_url' => $this->files->publicUrl($profile->logo_path),
        ];
    }
}
