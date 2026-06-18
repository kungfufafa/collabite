<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    public function __invoke(Request $request): RedirectResponse|Response
    {
        if ($request->user()?->hasVerifiedEmail()) {
            return redirect()->intended($this->dashboardUrl($request->user()));
        }

        return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }

    private function dashboardUrl(Authenticatable $user): string
    {
        /** @var User $u */
        $u = $user;

        if (method_exists($u, 'isAdmin') && $u->isAdmin()) {
            return route('admin.dashboard');
        }
        if (method_exists($u, 'isUmkm') && $u->isUmkm()) {
            return route('umkm.dashboard');
        }
        if (method_exists($u, 'isCreator') && $u->isCreator()) {
            return route('creator.dashboard');
        }

        return route('home');
    }
}
