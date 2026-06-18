<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CreatorVerification;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class VerificationPolicy
{
    public function review(User $actor, CreatorVerification $verification): Response
    {
        return $actor->isAdmin()
            ? Response::allow()
            : Response::deny('Hanya admin.');
    }

    public function submit(User $actor, CreatorVerification $verification): Response
    {
        return $actor->is($verification->creatorProfile->user)
            ? Response::allow()
            : Response::deny('Hanya pemilik yang dapat mengajukan.');
    }
}
