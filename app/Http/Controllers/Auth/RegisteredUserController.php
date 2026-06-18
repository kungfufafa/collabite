<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\RegisterCreatorAction;
use App\Actions\Auth\RegisterUmkmAction;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterCreatorRequest;
use App\Http\Requests\Auth\RegisterUmkmRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk pendaftaran akun UMKM & Creator.
 * Melihat PRD §11.1 (FR-AUTH-001, FR-AUTH-002), UC-AUTH-001, UC-AUTH-002.
 */
class RegisteredUserController extends Controller
{
    /**
     * Halaman pemilihan peran saat registrasi.
     */
    public function create(Request $request): Response
    {
        $role = $request->query('role');

        return Inertia::render('Auth/Register', [
            'role' => in_array($role, [UserRole::Umkm->value, UserRole::Creator->value], true)
                ? $role
                : null,
        ]);
    }

    /**
     * Proses registrasi UMKM.
     */
    public function storeUmkm(RegisterUmkmRequest $request, RegisterUmkmAction $action): RedirectResponse
    {
        $action->execute($request->validated());

        return redirect()
            ->route('verification.notice')
            ->with('status', 'Akun UMKM berhasil dibuat. Silakan verifikasi email Anda.');
    }

    /**
     * Proses registrasi Creator.
     */
    public function storeCreator(RegisterCreatorRequest $request, RegisterCreatorAction $action): RedirectResponse
    {
        $action->execute($request->validated());

        return redirect()
            ->route('verification.notice')
            ->with('status', 'Akun Creator berhasil dibuat. Silakan verifikasi email Anda.');
    }
}
