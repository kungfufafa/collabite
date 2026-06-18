<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Collaboration;
use App\Models\ContentSubmission;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ContentSubmissionPolicy
{
    public function view(User $actor, ContentSubmission $submission): Response
    {
        return app(CollaborationPolicy::class)->view($actor, $submission->collaboration);
    }

    public function create(User $actor, Collaboration $collaboration): Response
    {
        return $actor->is($collaboration->creator)
            ? Response::allow()
            : Response::deny('Hanya Creator pada kolaborasi.');
    }

    public function submitForReview(User $actor, ContentSubmission $submission): Response
    {
        return $actor->is($submission->collaboration->creator)
            ? Response::allow()
            : Response::deny('Hanya Creator yang mengirim.');
    }

    public function requestRevision(User $actor, ContentSubmission $submission): Response
    {
        return $actor->is($submission->collaboration->umkm)
            ? Response::allow()
            : Response::deny('Hanya UMKM yang dapat meminta revisi.');
    }

    public function approve(User $actor, ContentSubmission $submission): Response
    {
        return $actor->is($submission->collaboration->umkm)
            ? Response::allow()
            : Response::deny('Hanya UMKM yang dapat menyetujui submission.');
    }
}
