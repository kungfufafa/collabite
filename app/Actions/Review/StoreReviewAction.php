<?php

declare(strict_types=1);

namespace App\Actions\Review;

use App\Enums\CollaborationStatus;
use App\Models\Collaboration;
use App\Models\Review;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class StoreReviewAction
{
    public function execute(Collaboration $collaboration, User $reviewer, User $reviewee, array $data): Review
    {
        if ($collaboration->status !== CollaborationStatus::Completed) {
            throw ValidationException::withMessages(['collaboration' => 'Kolaborasi belum selesai.']);
        }

        $isParty = $reviewer->is($collaboration->umkm) || $reviewer->is($collaboration->creator);
        if (! $isParty) {
            throw ValidationException::withMessages(['review' => 'Anda bukan pihak kolaborasi.']);
        }

        $existing = Review::query()
            ->where('collaboration_id', $collaboration->id)
            ->where('reviewer_id', $reviewer->id)
            ->exists();
        if ($existing) {
            throw ValidationException::withMessages(['review' => 'Anda sudah memberi review untuk kolaborasi ini.']);
        }

        $review = Review::create([
            'collaboration_id' => $collaboration->id,
            'reviewer_id' => $reviewer->id,
            'reviewee_id' => $reviewee->id,
            'rating' => $data['rating'],
            'body' => $data['body'] ?? null,
        ]);

        // Update agregat rating Creator
        $this->recomputeCreatorRating($reviewee);

        return $review;
    }

    private function recomputeCreatorRating(User $user): void
    {
        $profile = $user->creatorProfile;
        if (! $profile) {
            return;
        }
        $reviews = Review::query()->where('reviewee_id', $user->id)->where('is_hidden', false);
        $count = (clone $reviews)->count();
        $avg = $count > 0 ? (float) (clone $reviews)->avg('rating') : 0.0;
        $profile->update([
            'rating_avg' => round($avg, 2),
            'rating_count' => $count,
        ]);
    }
}
