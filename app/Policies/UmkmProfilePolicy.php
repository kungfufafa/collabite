<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Authorization untuk profil UMKM (TDD §10).
 */
class UmkmProfilePolicy
{
    public function update(User $actor, UmkmProfile $profile): Response
    {
        return $actor->is($profile->user)
            ? Response::allow()
            : Response::deny('Anda tidak berhak mengubah profil UMKM ini.');
    }
}
