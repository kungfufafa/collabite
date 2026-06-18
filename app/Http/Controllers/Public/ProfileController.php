<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\UmkmProfile;
use App\Services\FileUrlService;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function showUmkm(UmkmProfile $umkmProfile): Response
    {
        $umkmProfile->load(['products' => fn ($q) => $q->where('is_active', true)]);

        return Inertia::render('Public/UmkmProfile', [
            'umkm' => [
                'id' => $umkmProfile->id,
                'business_name' => $umkmProfile->business_name,
                'business_type' => $umkmProfile->business_type,
                'description' => $umkmProfile->description,
                'address' => $umkmProfile->address,
                'city' => $umkmProfile->city,
                'website_url' => $umkmProfile->website_url,
                'logo_url' => $this->files->publicUrl($umkmProfile->logo_path),
                'products' => $umkmProfile->products->map(fn ($p): array => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'description' => $p->description,
                    'image_url' => $p->image_path ? $this->files->publicUrl($p->image_path) : null,
                ]),
            ],
        ]);
    }
}
