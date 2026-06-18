<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Authorization untuk campaign.
 */
class CampaignPolicy
{
    public function view(User $actor, Campaign $campaign): Response
    {
        // Public view untuk UMKM pemilik + Creator yang login (saat published)
        if ($actor->isUmkm() && $campaign->umkmProfile?->user_id === $actor->id) {
            return Response::allow();
        }

        if ($actor->isCreator() && $campaign->status->isPubliclyVisible() && ! $campaign->is_hidden) {
            return Response::allow();
        }

        return $actor->isAdmin()
            ? Response::allow()
            : Response::deny('Anda tidak berhak melihat campaign ini.');
    }

    public function update(User $actor, Campaign $campaign): Response
    {
        return ($actor->isUmkm() && $campaign->umkmProfile?->user_id === $actor->id)
            ? Response::allow()
            : Response::deny('Hanya pemilik UMKM yang dapat memperbarui campaign.');
    }

    public function delete(User $actor, Campaign $campaign): Response
    {
        return ($actor->isUmkm() && $campaign->umkmProfile?->user_id === $actor->id)
            ? Response::allow()
            : Response::deny('Hanya pemilik UMKM yang dapat menghapus campaign.');
    }
}
