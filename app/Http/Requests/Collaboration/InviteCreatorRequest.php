<?php

declare(strict_types=1);

namespace App\Http\Requests\Collaboration;

use App\Models\Campaign;
use Illuminate\Contracts\Validation\Validator;
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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $umkm = $this->user()?->umkmProfile;
            $campaignId = $this->input('campaign_id');

            if ($umkm && $campaignId) {
                $owned = Campaign::query()
                    ->where('id', $campaignId)
                    ->where('umkm_profile_id', $umkm->id)
                    ->exists();

                if (! $owned) {
                    $v->errors()->add('campaign_id', 'Campaign tidak ditemukan atau bukan milik Anda.');
                }
            }
        });
    }
}
