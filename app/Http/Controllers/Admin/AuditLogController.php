<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: lihat audit log (append-only).
 */
class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $query = ActivityLog::query();

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }
        if ($actorId = $request->query('actor_id')) {
            $query->where('actor_id', $actorId);
        }

        $logs = $query->latest('created_at')->paginate(50)->withQueryString();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs->through(fn (ActivityLog $l): array => [
                'id' => $l->id,
                'actor_id' => $l->actor_id,
                'actor_role' => $l->actor_role,
                'action' => $l->action,
                'subject_type' => $l->subject_type,
                'subject_id' => $l->subject_id,
                'metadata' => $l->metadata,
                'created_at' => $l->created_at?->toIso8601String(),
            ])->all(),
        ]);
    }
}
