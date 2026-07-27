<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use App\Notifications\ContentSubmittedForReviewNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class SubmitForReviewAction
{
    public function execute(ContentSubmission $submission): ContentSubmission
    {
        if ($submission->collaboration->status !== CollaborationStatus::Active) {
            throw ValidationException::withMessages(['collaboration' => 'Kolaborasi tidak aktif.']);
        }

        // Hanya Draft yang dapat dikirim untuk review. Submission berstatus
        // RevisionRequested adalah versi lama; creator harus membuat versi baru
        // via ResubmitSubmissionAction (yang menghasilkan Draft baru) sebelum
        // mengirim ulang — mencegah mengirim ulang versi yang sudah diminta revisi.
        if ($submission->status !== ContentSubmissionStatus::Draft) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dapat dikirim untuk review.']);
        }

        $submission->update([
            'status' => ContentSubmissionStatus::InReview,
            'submitted_at' => now(),
        ]);

        $submission->load('collaboration.umkm', 'collaboration.campaign');
        $umkm = $submission->collaboration->umkm;
        DB::afterCommit(fn () => Notification::send($umkm, new ContentSubmittedForReviewNotification($submission)));

        return $submission;
    }
}
