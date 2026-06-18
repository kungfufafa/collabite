<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\CreatorVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_umkm' => User::where('role', 'umkm')->count(),
            'total_creators' => User::where('role', 'creator')->count(),
            'pending_verifications' => CreatorVerification::where('status', 'pending')->count(),
            'active_campaigns' => Campaign::where('status', 'open')->count(),
            'active_collaborations' => Collaboration::where('status', 'active')->count(),
        ];

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
        ]);
    }
}
