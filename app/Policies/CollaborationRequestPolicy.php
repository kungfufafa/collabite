<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CollaborationRequest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Authorization untuk collaboration request.
 */
class CollaborationRequestPolicy
{
    public function view(User $actor, CollaborationRequest $request): Response
    {
        if ($actor->isAdmin()) {
            return Response::allow();
        }

        return $actor->is($request->sender) || $actor->is($request->creator)
            ? Response::allow()
            : Response::deny('Anda tidak berhak melihat request ini.');
    }

    public function cancel(User $actor, CollaborationRequest $request): Response
    {
        return ($request->type->value === 'application' && $actor->is($request->creator))
            ? Response::allow()
            : Response::deny('Creator hanya dapat membatalkan application miliknya.');
    }

    public function cancelInvitation(User $actor, CollaborationRequest $request): Response
    {
        if ($request->type->value !== 'invitation') {
            return Response::deny('Hanya undangan yang dapat dibatalkan oleh UMKM.');
        }

        if (! $request->status->isOpen()) {
            return Response::deny('Undangan sudah tidak pending.');
        }

        return $request->campaign->umkmProfile?->user_id === $actor->id
            ? Response::allow()
            : Response::deny('Hanya UMKM pemilik campaign yang dapat membatalkan undangan.');
    }

    public function respond(User $actor, CollaborationRequest $request): Response
    {
        // UMKM menerima/menolak application & Creator menerima/menolak invitation.
        if ($request->type->value === 'application') {
            return $request->campaign->umkmProfile?->user_id === $actor->id
                ? Response::allow()
                : Response::deny('Hanya UMKM pemilik campaign.');
        }

        return $actor->is($request->creator)
            ? Response::allow()
            : Response::deny('Hanya Creator yang diundang.');
    }
}
