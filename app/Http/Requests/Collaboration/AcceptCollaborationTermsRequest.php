<?php

declare(strict_types=1);

namespace App\Http\Requests\Collaboration;

use App\Models\CollaborationRequest;
use Illuminate\Foundation\Http\FormRequest;

class AcceptCollaborationTermsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $collaborationRequest = $this->route('collaborationRequest')
            ?? $this->route('requestModel')
            ?? $this->route('request');

        if ($this->user() === null || ! $collaborationRequest instanceof CollaborationRequest) {
            return false;
        }

        return $this->user()->can('respond', $collaborationRequest);
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'terms_accepted' => ['accepted'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'terms_accepted.accepted' => 'Anda wajib menyetujui Syarat dan Ketentuan sebelum menerima kolaborasi.',
        ];
    }
}
