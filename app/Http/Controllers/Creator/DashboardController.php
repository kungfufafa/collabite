<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Http\Controllers\Controller;
use App\Models\Collaboration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->creatorProfile;

        $stats = [
            'rating_avg' => $profile?->rating_avg ?? 0,
            'rating_count' => $profile?->rating_count ?? 0,
            'portfolio_items' => $profile?->portfolioItems()->count() ?? 0,
            'collaborations' => $profile?->user
                ? Collaboration::where('creator_id', $user->id)->count()
                : 0,
        ];

        return Inertia::render('Creator/Dashboard/Index', [
            'stats' => $stats,
            'profile' => $profile,
        ]);
    }
}
