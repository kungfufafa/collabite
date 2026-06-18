<?php

declare(strict_types=1);

namespace App\Http\Requests\Creator;

use Illuminate\Foundation\Http\FormRequest;

class ApplyCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isCreator();
    }

    public function rules(): array
    {
        return [
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
