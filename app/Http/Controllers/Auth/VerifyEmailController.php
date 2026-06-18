<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended($this->dashboardUrl($request->user()));
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect()->intended($this->dashboardUrl($request->user()));
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
