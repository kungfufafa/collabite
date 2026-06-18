<?php

declare(strict_types=1);

namespace App\Http\Controllers\Creator;

use App\Enums\VerificationDocumentType;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Creator\SubmitVerificationRequest;
use App\Models\CreatorProfile;
use App\Models\CreatorVerification;
use App\Models\CreatorVerificationDocument;
use App\Models\User;
use App\Services\FileUrlService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function __construct(private readonly FileUrlService $files) {}

    public function show(Request $request): Response
    {
        $profile = $this->profileForUser($request->user());

        $current = $profile->currentVerification();
        $portfolioCount = $profile->portfolioItems()->count();

        $documents = [];
        if ($current !== null) {
            $documents = $current->documents->map(fn (CreatorVerificationDocument $doc): array => [
                'id' => $doc->id,
                'type' => $doc->type->value,
                'type_label' => $doc->type->label(),
                'original_name' => $doc->original_name,
                'download_url' => $this->files->privateUrl($doc->file_path),
            ])->all();
        }

        return Inertia::render('Creator/Verification/Show', [
            'profile' => [
                'id' => $profile->id,
                'verification_status' => $profile->verification_status->value,
                'portfolio_count' => $portfolioCount,
                'has_profile' => $profile->headline !== null || $profile->bio !== null,
            ],
            'current_verification' => $current === null ? null : [
                'id' => $current->id,
                'status' => $current->status->value,
                'rejection_reason' => $current->rejection_reason,
                'submitted_at' => optional($current->submitted_at)->toIso8601String(),
                'documents' => $documents,
            ],
            'document_types' => collect(VerificationDocumentType::cases())
                ->map(fn ($case): array => [
                    'value' => $case->value,
                    'label' => $case->label(),
                ])->all(),
        ]);
    }

    public function submit(SubmitVerificationRequest $request): RedirectResponse
    {
        $profile = $this->profileForUser($request->user());

        abort_unless(
            ($profile->headline !== null && $profile->headline !== '') || ($profile->bio !== null && $profile->bio !== ''),
            422,
            'Lengkapi profil Creator terlebih dahulu.'
        );

        abort_unless(
            $profile->portfolioItems()->exists(),
            422,
            'Tambahkan minimal satu item portofolio.'
        );

        $data = $request->validated();

        DB::transaction(function () use ($profile, $data, $request): void {
            $verification = CreatorVerification::create([
                'creator_profile_id' => $profile->id,
                'status' => VerificationStatus::Pending,
                'submitted_at' => now(),
            ]);

            foreach ($data['documents'] as $index => $entry) {
                $file = $request->file("documents.$index.file");
                $path = $this->files->storePrivate($file, 'verification', $profile->id);

                $verification->documents()->create([
                    'type' => $entry['type'],
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType() ?? 'application/octet-stream',
                    'size' => $file->getSize() ?? 0,
                ]);
            }

            $profile->forceFill(['verification_status' => VerificationStatus::Pending])->save();
        });

        return redirect()->route('creator.verification.show')->with('status', 'Pengajuan verifikasi terkirim.');
    }

    private function profileForUser(User $user): CreatorProfile
    {
        return $user->creatorProfile()->firstOrFail();
    }
}
