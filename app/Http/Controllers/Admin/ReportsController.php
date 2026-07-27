<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin: laporan & statistik, ekspor CSV.
 */
class ReportsController extends Controller
{
    /**
     * @var list<string>
     */
    private const EXPORT_TYPES = ['users', 'campaigns', 'collaborations', 'reviews'];

    public function index(Request $request): InertiaResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $stats = [
            'users_total' => User::count(),
            'umkm_total' => User::where('role', 'umkm')->count(),
            'creator_total' => User::where('role', 'creator')->count(),
            'campaigns_total' => Campaign::count(),
            'campaigns_open' => Campaign::where('status', 'open')->count(),
            'campaigns_completed' => Campaign::where('status', 'completed')->count(),
            'collaborations_total' => Collaboration::count(),
            'collaborations_active' => Collaboration::where('status', 'active')->count(),
            'reviews_total' => Review::count(),
            'avg_rating' => round((float) Review::avg('rating'), 2),
        ];

        return Inertia::render('Admin/Reports/Index', [
            'stats' => $stats,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $type = (string) $request->query('type', 'users');
        if (! in_array($type, self::EXPORT_TYPES, true)) {
            abort(422, 'Jenis ekspor tidak valid.');
        }

        $filename = "collabite_{$type}_".now()->format('Ymd_His').'.csv';

        return Response::streamDownload(function () use ($type): void {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }

            match ($type) {
                'users' => $this->exportUsers($out),
                'campaigns' => $this->exportCampaigns($out),
                'collaborations' => $this->exportCollaborations($out),
                'reviews' => $this->exportReviews($out),
            };

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  resource  $out
     */
    private function exportUsers($out): void
    {
        $this->writeCsvRow($out, ['id', 'name', 'email', 'role', 'account_status', 'created_at']);
        User::query()->orderBy('id')->chunk(100, function ($chunk) use ($out): void {
            foreach ($chunk as $u) {
                $this->writeCsvRow($out, [
                    $u->id,
                    $u->name,
                    $u->email,
                    $u->role->value,
                    $u->account_status->value,
                    $u->created_at?->toIso8601String(),
                ]);
            }
        });
    }

    /**
     * @param  resource  $out
     */
    private function exportCampaigns($out): void
    {
        $this->writeCsvRow($out, ['id', 'title', 'status', 'category_id', 'umkm_id', 'published_at']);
        Campaign::query()->orderBy('id')->chunk(100, function ($chunk) use ($out): void {
            foreach ($chunk as $c) {
                $this->writeCsvRow($out, [
                    $c->id,
                    $c->title,
                    $c->status->value,
                    $c->category_id,
                    $c->umkm_profile_id,
                    $c->published_at?->toIso8601String(),
                ]);
            }
        });
    }

    /**
     * @param  resource  $out
     */
    private function exportCollaborations($out): void
    {
        $this->writeCsvRow($out, ['id', 'campaign_id', 'umkm_id', 'creator_id', 'status', 'started_at', 'completed_at']);
        Collaboration::query()->orderBy('id')->chunk(100, function ($chunk) use ($out): void {
            foreach ($chunk as $collab) {
                $this->writeCsvRow($out, [
                    $collab->id,
                    $collab->campaign_id,
                    $collab->umkm_id,
                    $collab->creator_id,
                    $collab->status->value,
                    $collab->started_at?->toIso8601String(),
                    $collab->completed_at?->toIso8601String(),
                ]);
            }
        });
    }

    /**
     * @param  resource  $out
     */
    private function exportReviews($out): void
    {
        $this->writeCsvRow($out, ['id', 'collaboration_id', 'reviewer_id', 'reviewee_id', 'rating', 'is_hidden']);
        Review::query()->orderBy('id')->chunk(100, function ($chunk) use ($out): void {
            foreach ($chunk as $r) {
                $this->writeCsvRow($out, [
                    $r->id,
                    $r->collaboration_id,
                    $r->reviewer_id,
                    $r->reviewee_id,
                    $r->rating,
                    $r->is_hidden ? '1' : '0',
                ]);
            }
        });
    }

    /**
     * @param  resource  $out
     * @param  list<null|scalar>  $row
     */
    private function writeCsvRow($out, array $row): void
    {
        // escape '' menonaktifkan escape proprietary (PHP 8.4+).
        fputcsv($out, $row, ',', '"', '');
    }
}
