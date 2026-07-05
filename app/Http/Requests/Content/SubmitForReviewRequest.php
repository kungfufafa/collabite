<?php

declare(strict_types=1);

namespace App\Http\Requests\Content;

use App\Models\ContentSubmission;
use Illuminate\Foundation\Http\FormRequest;

class SubmitForReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        $submission = $this->route('submission');

        return $submission instanceof ContentSubmission
            && ($this->user()?->can('submitForReview', $submission) ?? false);
    }

    public function rules(): array
    {
        return [];
    }
}
