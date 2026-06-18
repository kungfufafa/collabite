<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CollaborationRequestStatus;
use App\Models\CollaborationRequest;
use Illuminate\Validation\ValidationException;

/**
 * Creator membatalkan application (FR-COLLAB-006).
 */
class CancelApplicationAction
{
    public function execute(CollaborationRequest $request): CollaborationRequest
    {
        if ($request->status !== CollaborationRequestStatus::Pending) {
            throw ValidationException::withMessages(['request' => 'Request ini sudah tidak pending.']);
        }
        if ($request->type->value !== 'application') {
            throw ValidationException::withMessages(['request' => 'Hanya application yang dapat dibatalkan oleh Creator.']);
        }

        $request->update([
            'status' => CollaborationRequestStatus::CancelledByCreator,
            'responded_at' => now(),
        ]);

        return $request;
    }
}
