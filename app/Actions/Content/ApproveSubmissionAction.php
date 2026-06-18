<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use Illuminate\Validation\ValidationException;

class ApproveSubmissionAction
{
    public function execute(ContentSubmission $submission): ContentSubmission
    {
        if ($submission->status !== ContentSubmissionStatus::InReview) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dalam status InReview.']);
        }

        $submission->update([
            'status' => ContentSubmissionStatus::Approved,
            'approved_at' => now(),
        ]);

        return $submission;
    }
}
