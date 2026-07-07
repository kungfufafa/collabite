<?php

declare(strict_types=1);

namespace App\Http\Requests\Content;

use App\Models\ContentSubmission;
use Illuminate\Foundation\Http\FormRequest;

class ResubmitSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $submission = $this->route('submission');

        return $submission instanceof ContentSubmission
            && ($this->user()?->can('submitForReview', $submission) ?? false);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'files' => ['nullable', 'array', 'max:5'],
            'files.*' => ['file', 'max:102400', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm,pdf'],
        ];
    }
}
