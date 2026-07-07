<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Validation\ValidationException;

class ApproveSubmissionAction
{
    public function execute(ContentSubmission $submission, ?User $actor = null): ContentSubmission
    {
        if ($submission->status !== ContentSubmissionStatus::InReview) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dalam status InReview.']);
        }

        $previousStatus = $submission->status->value;
        $submission->update([
            'status' => ContentSubmissionStatus::Approved,
            'approved_at' => now(),
        ]);

        app(AuditLogger::class)->log($actor, 'content.approved', $submission->fresh(), [
            'collaboration_id' => $submission->collaboration_id,
            'previous_status' => $previousStatus,
            'version' => $submission->version,
        ]);

        return $submission;
    }
}
