<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use App\Models\User;
use App\Notifications\ContentRevisionRequestedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class RequestRevisionAction
{
    public function execute(ContentSubmission $submission, User $umkmUser, string $note): ContentSubmission
    {
        if ($submission->collaboration->status !== CollaborationStatus::Active) {
            throw ValidationException::withMessages(['collaboration' => 'Kolaborasi tidak aktif.']);
        }

        if ($submission->status !== ContentSubmissionStatus::InReview) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dalam status InReview.']);
        }

        // Catatan revisi wajib diisi (FR-CONTENT-004) agar creator tahu apa yang
        // harus diperbaiki; tolak note kosong secara defensif meski sudah divalidasi
        // di controller.
        if (trim($note) === '') {
            throw ValidationException::withMessages(['note' => 'Catatan revisi wajib diisi.']);
        }

        $submission->update(['status' => ContentSubmissionStatus::RevisionRequested]);
        $submission->revisions()->create([
            'umkm_id' => $umkmUser->id,
            'note' => $note,
        ]);

        $submission->load('collaboration.creator', 'collaboration.campaign');
        $creator = $submission->collaboration->creator;
        DB::afterCommit(fn () => Notification::send($creator, new ContentRevisionRequestedNotification($submission)));

        return $submission;
    }
}
