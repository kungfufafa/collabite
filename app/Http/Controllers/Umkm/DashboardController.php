<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $umkm = $user->umkmProfile()->withCount('campaigns')->first();

        $stats = [
            'total_campaigns' => $umkm?->campaigns_count ?? 0,
            'open_campaigns' => $umkm?->campaigns()->where('status', 'open')->count() ?? 0,
            'collaborations' => $umkm?->campaigns()->whereHas('collaboration')->count() ?? 0,
        ];

        return Inertia::render('Umkm/Dashboard/Index', [
            'stats' => $stats,
            'profile' => $umkm,
        ]);
    }
}
