<?php

declare(strict_types=1);

namespace App\Http\Controllers\Umkm;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardDataService $dashboardData,
    ) {}

    public function index(Request $request): Response
    {
        $payload = $this->dashboardData->forUmkm($request->user());

        return Inertia::render('Umkm/Dashboard/Index', $payload);
    }
}
