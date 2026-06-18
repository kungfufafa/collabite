<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use Illuminate\Validation\ValidationException;

class SubmitForReviewAction
{
    public function execute(ContentSubmission $submission): ContentSubmission
    {
        if (! in_array($submission->status, [ContentSubmissionStatus::Draft, ContentSubmissionStatus::RevisionRequested], true)) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dapat dikirim untuk review.']);
        }

        $submission->update([
            'status' => ContentSubmissionStatus::InReview,
            'submitted_at' => now(),
        ]);

        return $submission;
    }
}
