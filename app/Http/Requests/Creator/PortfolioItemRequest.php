<?php

declare(strict_types=1);

namespace App\Http\Requests\Creator;

use App\Rules\PortfolioMedia;
use Illuminate\Foundation\Http\FormRequest;

class PortfolioItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isCreator();
    }

    /**
     * @return array<string, array<int, string|PortfolioMedia>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'external_url' => ['nullable', 'url', 'max:255'],
            'media' => ['nullable', 'file', new PortfolioMedia],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
