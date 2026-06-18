<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Enums\VerificationDocumentType;
use App\Enums\VerificationStatus;
use App\Models\CreatorProfile;
use App\Models\CreatorVerification;
use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('local');
    Storage::fake('public');
});

function pendingVerification(): array
{
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create();
    PortfolioItem::factory()->for($profile, 'creatorProfile')->create();

    $verification = CreatorVerification::create([
        'creator_profile_id' => $profile->id,
        'status' => VerificationStatus::Pending,
        'submitted_at' => now(),
    ]);

    $file = UploadedFile::fake()->image('ktp.jpg');
    $path = $file->storeAs("verification/{$profile->id}", 'ktp.jpg', 'local');

    $verification->documents()->create([
        'type' => VerificationDocumentType::IdentityCard,
        'file_path' => $path,
        'original_name' => 'ktp.jpg',
        'mime_type' => 'image/jpeg',
        'size' => 1024,
    ]);

    return [$user, $profile, $verification];
}

test('admin can approve a pending verification', function (): void {
    [$owner, $profile, $verification] = pendingVerification();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.verifications.approve', $verification))
        ->assertRedirect();

    $verification->refresh();
    expect($verification->status)->toBe(VerificationStatus::Verified);
    expect($verification->reviewed_by)->toBe($admin->id);
    expect($verification->reviewed_at)->not->toBeNull();

    $profile->refresh();
    expect($profile->verification_status)->toBe(VerificationStatus::Verified);
});

test('admin can reject a pending verification with reason', function (): void {
    [, $profile, $verification] = pendingVerification();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.verifications.reject', $verification), [
            'rejection_reason' => 'Dokumen tidak terbaca',
        ])
        ->assertRedirect();

    $verification->refresh();
    expect($verification->status)->toBe(VerificationStatus::Rejected);
    expect($verification->rejection_reason)->toBe('Dokumen tidak terbaca');

    $profile->refresh();
    expect($profile->verification_status)->toBe(VerificationStatus::Rejected);
});

test('rejecting a verification requires a reason', function (): void {
    [, , $verification] = pendingVerification();
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($admin)
        ->from(route('admin.verifications.show', $verification))
        ->post(route('admin.verifications.reject', $verification), [
            'rejection_reason' => '',
        ])
        ->assertSessionHasErrors('rejection_reason');

    expect($verification->fresh()->status)->toBe(VerificationStatus::Pending);
});

test('non admin cannot access verification review routes', function (): void {
    [, , $verification] = pendingVerification();
    $creator = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);

    $this->actingAs($creator)
        ->post(route('admin.verifications.approve', $verification))
        ->assertForbidden();

    $this->actingAs($creator)
        ->post(route('admin.verifications.reject', $verification), [
            'rejection_reason' => 'Coba-coba',
        ])
        ->assertForbidden();
});
