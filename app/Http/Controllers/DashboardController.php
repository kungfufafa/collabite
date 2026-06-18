<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dashboard dispatcher sesuai peran.
 */
class DashboardController extends Controller
{
    /**
     * Redirect ke dashboard spesifik sesuai role.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        if ($user->isUmkm()) {
            return redirect()->route('umkm.dashboard');
        }
        if ($user->isCreator()) {
            return redirect()->route('creator.dashboard');
        }

        return Inertia::render('Dashboard', ['role' => $user->role->value]);
    }
}
