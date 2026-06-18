<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Pencatat audit log (append-only).
 * Dipanggil dari Action class untuk event-event utama.
 */
class AuditLogger
{
    public function log(User|string|null $actor, string $action, ?Model $subject = null, array $metadata = []): ActivityLog
    {
        $actorId = null;
        $actorRole = null;
        if ($actor instanceof User) {
            $actorId = $actor->id;
            $actorRole = $actor->role->value;
        } elseif (is_string($actor)) {
            $actorRole = $actor;
        }

        return ActivityLog::create([
            'actor_id' => $actorId,
            'actor_role' => $actorRole,
            'action' => $action,
            'subject_type' => $subject ? Str::of(get_class($subject))->afterLast('\\')->toString().'#'.$subject->getKey() : null,
            'subject_id' => $subject?->getKey(),
            'metadata' => $metadata ?: null,
            'created_at' => now(),
        ]);
    }
}
