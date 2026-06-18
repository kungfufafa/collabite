<?php

declare(strict_types=1);

namespace App\Http\Requests\Umkm;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isUmkm();
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:5000'],
            'category_id' => ['required', 'exists:categories,id'],
            'budget' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'deadline' => ['nullable', 'date', 'after:today'],
            'deliverables' => ['nullable', 'array'],
            'deliverables.*.title' => ['required_with:deliverables', 'string', 'max:160'],
            'deliverables.*.description' => ['nullable', 'string', 'max:1000'],
            'deliverables.*.quantity' => ['nullable', 'integer', 'min:1', 'max:1000'],
        ];
    }
}
