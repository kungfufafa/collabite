<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\CreatorVerification;
use App\Models\CreatorVerificationDocument;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VerificationsController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $verifications = CreatorVerification::query()
            ->with(['creatorProfile.user', 'documents'])
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('submitted_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Verifications/Index', [
            'verifications' => $verifications->through(fn (CreatorVerification $v): array => $this->serializeSummary($v))->all(),
            'pagination' => [
                'current_page' => $verifications->currentPage(),
                'last_page' => $verifications->lastPage(),
                'per_page' => $verifications->perPage(),
                'total' => $verifications->total(),
            ],
        ]);
    }

    public function show(Request $request, CreatorVerification $verification): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $verification->load(['creatorProfile.user', 'documents', 'reviewer']);

        return Inertia::render('Admin/Verifications/Show', [
            'verification' => $this->serializeDetail($verification),
        ]);
    }

    public function approve(Request $request, CreatorVerification $verification): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        DB::transaction(function () use ($verification, $request): void {
            $verification->forceFill([
                'status' => VerificationStatus::Verified,
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
                'rejection_reason' => null,
            ])->save();

            $verification->creatorProfile()->update([
                'verification_status' => VerificationStatus::Verified,
            ]);
        });

        return back()->with('status', 'Verifikasi disetujui.');
    }

    public function reject(Request $request, CreatorVerification $verification): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        DB::transaction(function () use ($verification, $data, $request): void {
            $verification->forceFill([
                'status' => VerificationStatus::Rejected,
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->id,
                'rejection_reason' => $data['rejection_reason'],
            ])->save();

            $verification->creatorProfile()->update([
                'verification_status' => VerificationStatus::Rejected,
            ]);
        });

        return back()->with('status', 'Verifikasi ditolak.');
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeSummary(CreatorVerification $verification): array
    {
        $user = $verification->creatorProfile?->user;

        return [
            'id' => $verification->id,
            'status' => $verification->status->value,
            'submitted_at' => optional($verification->submitted_at)->toIso8601String(),
            'creator' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
            ],
            'documents_count' => $verification->documents->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeDetail(CreatorVerification $verification): array
    {
        $summary = $this->serializeSummary($verification);

        $summary['rejection_reason'] = $verification->rejection_reason;
        $summary['reviewed_at'] = optional($verification->reviewed_at)->toIso8601String();
        $summary['reviewer'] = $verification->reviewer ? [
            'id' => $verification->reviewer->id,
            'name' => $verification->reviewer->name,
        ] : null;
        $summary['documents'] = $verification->documents->map(fn (CreatorVerificationDocument $doc): array => [
            'id' => $doc->id,
            'type' => $doc->type->value,
            'type_label' => $doc->type->label(),
            'original_name' => $doc->original_name,
            'mime_type' => $doc->mime_type,
            'size' => $doc->size,
            'download_url' => $this->files->privateUrl($doc->file_path),
        ])->all();

        return $summary;
    }
}
