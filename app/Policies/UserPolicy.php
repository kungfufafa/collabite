<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Authorization untuk resource User (TDD §10).
 */
class UserPolicy
{
    /**
     * Lihat profil akun sendiri atau profil publik lain.
     */
    public function view(User $actor, User $subject): Response
    {
        return Response::allow();
    }

    /**
     * Perbarui akun: hanya pemilik akun atau admin.
     */
    public function update(User $actor, User $subject): Response
    {
        if ($actor->isAdmin()) {
            return Response::allow();
        }

        return $actor->is($subject)
            ? Response::allow()
            : Response::deny('Anda tidak berhak memperbarui akun ini.');
    }

    /**
     * Mengubah status akun: hanya admin.
     */
    public function changeStatus(User $actor, User $subject): Response
    {
        if ($actor->isAdmin()) {
            // Admin tidak boleh men-suspend admin lain untuk mencegah lockout.
            if ($actor->is($subject)) {
                return Response::deny('Admin tidak dapat mengubah status akun sendiri.');
            }

            return Response::allow();
        }

        return Response::deny('Hanya admin yang dapat mengubah status akun.');
    }

    /**
     * Lihat data internal (admin area).
     */
    public function viewAdminData(User $actor, User $subject): Response
    {
        return $actor->isAdmin()
            ? Response::allow()
            : Response::deny('Hanya admin yang dapat melihat data ini.');
    }
}
