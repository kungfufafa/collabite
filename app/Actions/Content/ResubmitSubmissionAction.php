<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Enums\ContentSubmissionStatus;
use App\Models\ContentSubmission;
use App\Services\FileUrlService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResubmitSubmissionAction
{
    public function __construct(private readonly FileUrlService $files) {}

    /**
     * @param  array{title:string, description?:string|null, files?:array<int, UploadedFile>}  $data
     */
    public function execute(ContentSubmission $oldSubmission, array $data): ContentSubmission
    {
        if ($oldSubmission->status !== ContentSubmissionStatus::RevisionRequested) {
            throw ValidationException::withMessages(['submission' => 'Submission tidak dalam status RevisionRequested.']);
        }

        // Approved submissions are immutable (BR-014): tidak boleh superseded.
        $hasApproved = $oldSubmission->collaboration->submissions()
            ->where('status', ContentSubmissionStatus::Approved)
            ->exists();
        if ($hasApproved) {
            throw ValidationException::withMessages(['submission' => 'Submission Approved tidak dapat digantikan.']);
        }

        return DB::transaction(function () use ($oldSubmission, $data): ContentSubmission {
            $oldSubmission->status = ContentSubmissionStatus::Superseded;
            $oldSubmission->save();

            $version = ($oldSubmission->collaboration->submissions()->max('version') ?? 0) + 1;

            $new = $oldSubmission->collaboration->submissions()->create([
                'version' => $version,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => ContentSubmissionStatus::Draft,
            ]);

            foreach (($data['files'] ?? []) as $file) {
                $path = $this->files->storePrivate($file, 'submission', $new->id);
                $new->files()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                    'size' => $file->getSize() ?? 0,
                ]);
            }

            return $new;
        });
    }
}
