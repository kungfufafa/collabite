<?php

declare(strict_types=1);

namespace App\Http\Requests\Collaboration;

use Illuminate\Foundation\Http\FormRequest;

class InviteCreatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isUmkm();
    }

    public function rules(): array
    {
        return [
            'campaign_id' => ['required', 'integer', 'exists:campaigns,id'],
            'creator_id' => ['required', 'integer', 'exists:users,id'],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
