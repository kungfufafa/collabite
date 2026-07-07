<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\VerificationDocumentType;
use App\Models\CreatorVerification;
use App\Models\CreatorVerificationDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CreatorVerificationDocument>
 */
class CreatorVerificationDocumentFactory extends Factory
{
    protected $model = CreatorVerificationDocument::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uuid = fake()->uuid();

        return [
            'creator_verification_id' => CreatorVerification::factory(),
            'type' => VerificationDocumentType::IdentityCard,
            'file_path' => 'verifications/1/'.$uuid.'.pdf',
            'original_name' => fake()->randomElement(['ktp.pdf', 'portfolio-proof.pdf', 'dokumen-pendukung.pdf']),
            'mime_type' => 'application/pdf',
            'size' => fake()->numberBetween(80_000, 2_000_000),
        ];
    }

    public function portfolioProof(): static
    {
        return $this->state(fn (): array => [
            'type' => VerificationDocumentType::PortfolioProof,
        ]);
    }
}
