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

        $action = $request->query('action');
        $actorId = $request->query('actor_id');
        $keyword = trim((string) $request->query('q', ''));

        if ($action) {
            $query->where('action', $action);
        }
        if ($actorId) {
            $query->where('actor_id', $actorId);
        }
        if ($keyword !== '') {
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('action', 'like', "%{$keyword}%")
                    ->orWhere('actor_role', 'like', "%{$keyword}%")
                    ->orWhere('subject_type', 'like', "%{$keyword}%")
                    ->orWhere('metadata', 'like', "%{$keyword}%");

                if (ctype_digit($keyword)) {
                    $id = (int) $keyword;
                    $builder->orWhere('actor_id', $id)
                        ->orWhere('subject_id', $id);
                }
            });
        }

        $logs = $query->latest('created_at')->paginate(50)->withQueryString();
        $logs->setCollection(
            $logs->getCollection()->map(fn (ActivityLog $l): array => [
                'id' => $l->id,
                'actor_id' => $l->actor_id,
                'actor_role' => $l->actor_role,
                'action' => $l->action,
                'subject_type' => $l->subject_type,
                'subject_id' => $l->subject_id,
                'metadata' => $l->metadata,
                'created_at' => $l->created_at?->toIso8601String(),
            ]),
        );

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'action' => $action,
                'actor_id' => $actorId,
                'q' => $keyword !== '' ? $keyword : null,
            ],
        ]);
    }
}
