<?php

declare(strict_types=1);

namespace App\Actions\Collaboration;

use App\Enums\CollaborationRequestStatus;
use App\Models\CollaborationRequest;
use Illuminate\Validation\ValidationException;

class RejectRequestAction
{
    public function execute(CollaborationRequest $request, ?string $reason = null): CollaborationRequest
    {
        if ($request->status !== CollaborationRequestStatus::Pending) {
            throw ValidationException::withMessages(['request' => 'Request ini sudah tidak pending.']);
        }

        $request->update([
            'status' => CollaborationRequestStatus::Rejected,
            'responded_at' => now(),
            'message' => $reason ? ($request->message."\n\n[Reject reason] ".$reason) : $request->message,
        ]);

        return $request;
    }
}
