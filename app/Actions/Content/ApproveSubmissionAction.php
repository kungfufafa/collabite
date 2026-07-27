<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use App\Models\User;
use App\Notifications\ContentApprovedNotification;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class ApproveSubmissionAction
{
    public function execute(ContentSubmission $submission, ?User $actor = null): ContentSubmission
    {
        if ($submission->collaboration->status !== CollaborationStatus::Active) {
            throw ValidationException::withMessages(['collaboration' => 'Kolaborasi tidak aktif.']);
        }

        if ($submission->status !== ContentSubmissionStatus::InReview) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dalam status InReview.']);
        }

        // Approved adalah terminal (BR-014): tolak jika sudah ada submission
        // Approved lain pada kolaborasi yang sama.
        $hasApproved = $submission->collaboration->submissions()
            ->where('status', ContentSubmissionStatus::Approved)
            ->exists();
        if ($hasApproved) {
            throw ValidationException::withMessages(['submission' => 'Sudah ada submission yang disetujui pada kolaborasi ini.']);
        }

        $previousStatus = $submission->status->value;

        return DB::transaction(function () use ($submission, $actor, $previousStatus): ContentSubmission {
            $submission->update([
                'status' => ContentSubmissionStatus::Approved,
                'approved_at' => now(),
            ]);

            // Supersede submission InReview lain yang tersisa.
            $submission->collaboration->submissions()
                ->where('id', '!=', $submission->id)
                ->where('status', ContentSubmissionStatus::InReview)
                ->update(['status' => ContentSubmissionStatus::Superseded]);

            app(AuditLogger::class)->log($actor, 'content.approved', $submission->fresh(), [
                'collaboration_id' => $submission->collaboration_id,
                'previous_status' => $previousStatus,
                'version' => $submission->version,
            ]);

            $submission->load('collaboration.creator', 'collaboration.campaign');
            $creator = $submission->collaboration->creator;
            DB::afterCommit(fn () => Notification::send($creator, new ContentApprovedNotification($submission)));

            return $submission;
        });
    }
}
