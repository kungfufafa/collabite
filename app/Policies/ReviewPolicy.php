<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Collaboration;
use App\Models\Review;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ReviewPolicy
{
    public function create(User $actor, Collaboration $collaboration): Response
    {
        if ($collaboration->status->value !== 'completed') {
            return Response::deny('Review hanya untuk kolaborasi yang sudah selesai.');
        }

        return $actor->is($collaboration->umkm) || $actor->is($collaboration->creator)
            ? Response::allow()
            : Response::deny('Hanya peserta kolaborasi.');
    }

    public function hide(User $actor, Review $review): Response
    {
        return $actor->isAdmin()
            ? Response::allow()
            : Response::deny('Hanya admin.');
    }
}
