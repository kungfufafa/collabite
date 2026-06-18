<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Authorization untuk profil Creator (TDD §10).
 */
class CreatorProfilePolicy
{
    public function update(User $actor, CreatorProfile $profile): Response
    {
        return $actor->is($profile->user)
            ? Response::allow()
            : Response::deny('Anda tidak berhak mengubah profil Creator ini.');
    }
}
