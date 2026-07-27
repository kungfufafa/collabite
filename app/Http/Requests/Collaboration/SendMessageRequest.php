<?php

declare(strict_types=1);

namespace App\Http\Requests\Collaboration;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
            'attachments' => ['sometimes', 'array', 'max: 5'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,webp,gif,mp4,quicktime,webm,pdf', 'max:15360'],
        ];
    }
}
