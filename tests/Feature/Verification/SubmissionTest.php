<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\VerificationDocumentType;
use App\Enums\VerificationStatus;
use App\Models\CreatorProfile;
use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('creator can submit verification when profile and portfolio exist', function (): void {
    StorageFake();

    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create([
        'headline' => 'Hello',
        'bio' => 'Saya kreator.',
    ]);
    PortfolioItem::factory()->for($profile, 'creatorProfile')->create();

    $file = UploadedFile::fake()->image('ktp.jpg');

    $this->actingAs($user)
        ->post(route('creator.verification.submit'), [
            'documents' => [
                ['type' => VerificationDocumentType::IdentityCard->value, 'file' => $file],
            ],
        ])
        ->assertRedirect(route('creator.verification.show'));

    $profile->refresh();
    expect($profile->verification_status)->toBe(VerificationStatus::Pending);
    expect($profile->verifications()->count())->toBe(1);
    $verification = $profile->verifications()->first();
    expect($verification->status)->toBe(VerificationStatus::Pending);
    expect($verification->documents()->count())->toBe(1);
});

test('submitting verification requires a profile', function (): void {
    StorageFake();

    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create([
        'headline' => null,
        'bio' => null,
    ]);

    $file = UploadedFile::fake()->image('ktp.jpg');

    $this->actingAs($user)
        ->post(route('creator.verification.submit'), [
            'documents' => [
                ['type' => VerificationDocumentType::IdentityCard->value, 'file' => $file],
            ],
        ])
        ->assertStatus(422);
});

test('submitting verification requires at least one portfolio item', function (): void {
    StorageFake();

    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($user, 'user')->create([
        'headline' => 'Hello',
        'bio' => 'Bio',
    ]);

    $file = UploadedFile::fake()->image('ktp.jpg');

    $this->actingAs($user)
        ->post(route('creator.verification.submit'), [
            'documents' => [
                ['type' => VerificationDocumentType::IdentityCard->value, 'file' => $file],
            ],
        ])
        ->assertStatus(422);
});

test('only owner can submit verification', function (): void {
    StorageFake();

    $owner = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $other = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($owner, 'user')->create();
    $otherProfile = CreatorProfile::factory()->for($other, 'user')->create();
    PortfolioItem::factory()->for($otherProfile, 'creatorProfile')->create();

    $file = UploadedFile::fake()->image('ktp.jpg');

    // 'other' submits verification for their own profile; this should succeed
    // and create a verification for $otherProfile (NOT for $owner's profile).
    $this->actingAs($other)
        ->post(route('creator.verification.submit'), [
            'documents' => [
                ['type' => VerificationDocumentType::IdentityCard->value, 'file' => $file],
            ],
        ])
        ->assertRedirect();

    expect($owner->creatorProfile->verifications()->count())->toBe(0);
    expect($otherProfile->verifications()->count())->toBe(1);
});

test('verification documents accept image and pdf', function (): void {
    StorageFake();

    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create([
        'headline' => 'Hello',
        'bio' => 'Bio',
    ]);
    PortfolioItem::factory()->for($profile, 'creatorProfile')->create();

    $img = UploadedFile::fake()->image('ktp.jpg');
    $pdf = UploadedFile::fake()->create('portofolio.pdf', 50, 'application/pdf');

    $this->actingAs($user)
        ->post(route('creator.verification.submit'), [
            'documents' => [
                ['type' => VerificationDocumentType::IdentityCard->value, 'file' => $img],
                ['type' => VerificationDocumentType::PortfolioProof->value, 'file' => $pdf],
            ],
        ])
        ->assertRedirect();

    expect($profile->verifications()->first()->documents()->count())->toBe(2);
});

function StorageFake(): void
{
    Storage::fake('local');
    Storage::fake('public');
}
