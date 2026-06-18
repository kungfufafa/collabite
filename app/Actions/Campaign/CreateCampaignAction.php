<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\UmkmProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Buat campaign baru (UC-CAMP-001, FR-CAMPAIGN-001).
 */
class CreateCampaignAction
{
    /**
     * @param  array{
     *   title: string,
     *   description: string,
     *   category_id: int,
     *   budget?: float|null,
     *   deadline?: string|null,
     *   deliverables?: array<int, array{title:string, description?:string|null, quantity?:int}>
     * }  $data
     */
    public function execute(UmkmProfile $umkm, array $data): Campaign
    {
        $category = Category::find($data['category_id']);
        if (! $category) {
            throw ValidationException::withMessages(['category_id' => 'Kategori tidak valid.']);
        }

        return DB::transaction(function () use ($umkm, $data): Campaign {
            $campaign = $umkm->campaigns()->create([
                'title' => $data['title'],
                'description' => $data['description'],
                'category_id' => $data['category_id'],
                'budget' => $data['budget'] ?? null,
                'deadline' => $data['deadline'] ?? null,
                'status' => CampaignStatus::Draft,
            ]);

            foreach (($data['deliverables'] ?? []) as $deliverable) {
                if (empty($deliverable['title'])) {
                    continue;
                }
                $campaign->deliverables()->create([
                    'title' => $deliverable['title'],
                    'description' => $deliverable['description'] ?? null,
                    'quantity' => $deliverable['quantity'] ?? 1,
                ]);
            }

            return $campaign;
        });
    }
}
