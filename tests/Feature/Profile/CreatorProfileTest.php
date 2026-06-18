<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\CreatorProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('creator can view and update their own profile', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->get(route('creator.profile.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Creator/Profile/Edit'));

    $this->actingAs($user)
        ->patch(route('creator.profile.update'), [
            'headline' => 'Content Creator Jakarta',
            'bio' => 'Saya membuat video pendek.',
            'city' => 'Jakarta',
            'contact_phone' => '08123456789',
            'contact_email' => 'creator@example.com',
        ])
        ->assertRedirect();

    $profile->refresh();
    expect($profile->headline)->toBe('Content Creator Jakarta');
    expect($profile->bio)->toBe('Saya membuat video pendek.');
    expect($profile->city)->toBe('Jakarta');
});

test('creator profile photo is stored on the public disk', function (): void {
    Storage::fake('public');

    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create();
    $file = UploadedFile::fake()->image('avatar.jpg', 400, 400);

    $this->actingAs($user)
        ->patch(route('creator.profile.update'), [
            'headline' => 'Headline',
            'profile_photo' => $file,
        ])
        ->assertRedirect();

    $profile->refresh();
    expect($profile->profile_photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($profile->profile_photo_path);
});

test('update profile validates email format', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->from(route('creator.profile.edit'))
        ->patch(route('creator.profile.update'), [
            'contact_email' => 'not-an-email',
        ])
        ->assertSessionHasErrors('contact_email');
});

test('another creator cannot edit someone elses profile', function (): void {
    $owner = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $other = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($owner, 'user')->create();

    // Different user must not be able to change profile fields. The request should
    // not succeed (either 404 because no profile for them, or redirect) and must
    // never mutate $profile (the owner's).
    $this->actingAs($other)
        ->patch(route('creator.profile.update'), [
            'headline' => 'Hacked headline',
        ]);

    $profile->refresh();
    expect($profile->headline)->not->toBe('Hacked headline');
});

test('non creator cannot access the profile edit route', function (): void {
    $umkm = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);

    $this->actingAs($umkm)
        ->get(route('creator.profile.edit'))
        ->assertForbidden();

    $this->actingAs($umkm)
        ->patch(route('creator.profile.update'), ['headline' => 'X'])
        ->assertForbidden();
});
