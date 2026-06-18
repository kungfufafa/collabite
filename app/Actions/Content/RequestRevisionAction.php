<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class RequestRevisionAction
{
    public function execute(ContentSubmission $submission, User $umkmUser, string $note): ContentSubmission
    {
        if ($submission->status !== ContentSubmissionStatus::InReview) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dalam status InReview.']);
        }

        $submission->update(['status' => ContentSubmissionStatus::RevisionRequested]);
        $submission->revisions()->create([
            'umkm_id' => $umkmUser->id,
            'note' => $note,
        ]);

        return $submission;
    }
}
