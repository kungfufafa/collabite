<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Collaboration;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Authorization untuk kolaborasi (UC-COLLAB-010, FR-COLLAB-010).
 */
class CollaborationPolicy
{
    public function view(User $actor, Collaboration $collaboration): Response
    {
        if ($actor->isAdmin()) {
            return Response::allow();
        }

        return $actor->is($collaboration->umkm) || $actor->is($collaboration->creator)
            ? Response::allow()
            : Response::deny('Anda bukan peserta kolaborasi ini.');
    }

    public function sendMessage(User $actor, Collaboration $collaboration): Response
    {
        return $this->view($actor, $collaboration);
    }

    public function complete(User $actor, Collaboration $collaboration): Response
    {
        return $actor->is($collaboration->umkm)
            ? Response::allow()
            : Response::deny('Hanya UMKM yang dapat menutup kolaborasi.');
    }
}
