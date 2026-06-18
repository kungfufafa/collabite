<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests are redirected from edit page', function (): void {
    $this->get(route('umkm.profile.edit'))->assertRedirect(route('login'));
});

test('edit page renders for verified UMKM', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->get(route('umkm.profile.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Umkm/Profile/Edit')
            ->where('profile.business_name', fn (string $name) => $name !== '')
            ->etc(),
        );
});

test('edit page redirects unverified UMKM to verification notice', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->unverified()->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->get(route('umkm.profile.edit'))
        ->assertRedirect(route('verification.notice'));
});

test('creator cannot open UMKM profile edit page', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create();

    $this->actingAs($user)
        ->get(route('umkm.profile.edit'))
        ->assertForbidden();
});

test('update saves profile fields', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create([
        'business_name' => 'Old Name',
        'business_type' => 'F&B',
    ]);

    $this->actingAs($user)
        ->patch(route('umkm.profile.update'), [
            'business_name' => 'New Name',
            'business_type' => 'Fashion',
            'description' => 'Updated description',
            'city' => 'Bandung',
            'website_url' => 'https://example.test',
        ])
        ->assertRedirect();

    $profile->refresh();

    expect($profile->business_name)->toBe('New Name')
        ->and($profile->business_type)->toBe('Fashion')
        ->and($profile->description)->toBe('Updated description')
        ->and($profile->city)->toBe('Bandung')
        ->and($profile->website_url)->toBe('https://example.test');
});

test('update stores uploaded logo on public disk', function (): void {
    Storage::fake('public');
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();

    $logo = UploadedFile::fake()->image('logo.png', 200, 200);

    $this->actingAs($user)
        ->patch(route('umkm.profile.update'), [
            'business_name' => $profile->business_name,
            'business_type' => $profile->business_type,
            'logo' => $logo,
        ])
        ->assertRedirect();

    $profile->refresh();

    expect($profile->logo_path)->not->toBeNull()
        ->and($profile->logo_path)->toStartWith("umkm/{$profile->id}/");

    Storage::disk('public')->assertExists($profile->logo_path);
});

test('update replaces an existing logo', function (): void {
    Storage::fake('public');
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create([
        'logo_path' => 'umkm/'.$user->id.'/old.png',
    ]);
    Storage::disk('public')->put('umkm/'.$user->id.'/old.png', 'old');

    $newLogo = UploadedFile::fake()->image('logo.png', 200, 200);

    $this->actingAs($user)
        ->patch(route('umkm.profile.update'), [
            'business_name' => $profile->business_name,
            'business_type' => $profile->business_type,
            'logo' => $newLogo,
        ])
        ->assertRedirect();

    $profile->refresh();

    Storage::disk('public')->assertMissing('umkm/'.$user->id.'/old.png');
    Storage::disk('public')->assertExists($profile->logo_path);
    expect($profile->logo_path)->not->toBe('umkm/'.$user->id.'/old.png');
});

test('update requires business_name and business_type', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->from(route('umkm.profile.edit'))
        ->patch(route('umkm.profile.update'), [
            'business_name' => '',
            'business_type' => '',
        ])
        ->assertSessionHasErrors(['business_name', 'business_type']);
});

test('update validates contact_email is a valid email', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->from(route('umkm.profile.edit'))
        ->patch(route('umkm.profile.update'), [
            'business_name' => 'Name',
            'business_type' => 'F&B',
            'contact_email' => 'not-an-email',
        ])
        ->assertSessionHasErrors('contact_email');
});

test('update validates website_url is a URL', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->from(route('umkm.profile.edit'))
        ->patch(route('umkm.profile.update'), [
            'business_name' => 'Name',
            'business_type' => 'F&B',
            'website_url' => 'not a url',
        ])
        ->assertSessionHasErrors('website_url');
});

test('update rejects non-image logo with invalid mimes', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $file = UploadedFile::fake()->create('logo.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->from(route('umkm.profile.edit'))
        ->patch(route('umkm.profile.update'), [
            'business_name' => 'Name',
            'business_type' => 'F&B',
            'logo' => $file,
        ])
        ->assertSessionHasErrors('logo');
});

test('update rejects logo larger than 2MB', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $file = UploadedFile::fake()->image('logo.png')->size(3 * 1024); // 3MB

    $this->actingAs($user)
        ->from(route('umkm.profile.edit'))
        ->patch(route('umkm.profile.update'), [
            'business_name' => 'Name',
            'business_type' => 'F&B',
            'logo' => $file,
        ])
        ->assertSessionHasErrors('logo');
});

test('creator cannot update another UMKM profile', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create();
    $umkm = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($umkm, 'user')->create();

    $this->actingAs($creator)
        ->patch(route('umkm.profile.update'), [
            'business_name' => 'Hacked',
            'business_type' => 'F&B',
        ])
        ->assertForbidden();
});

test('admin cannot update UMKM profile via this route', function (): void {
    $admin = User::factory()->withRole(UserRole::Admin)->create();

    $this->actingAs($admin)
        ->patch(route('umkm.profile.update'), [
            'business_name' => 'Hacked',
            'business_type' => 'F&B',
        ])
        ->assertForbidden();
});

test('public can view UMKM profile by route model binding', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create([
        'business_name' => 'Kopi Mantap',
    ]);

    $this->get(route('public.umkm.show', $profile))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/UmkmProfile')
            ->where('umkm.business_name', 'Kopi Mantap'),
        );
});

test('public UMKM page only shows active products', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    Product::factory()->for($profile, 'umkmProfile')->create([
        'name' => 'Visible',
        'is_active' => true,
    ]);
    Product::factory()->for($profile, 'umkmProfile')->create([
        'name' => 'Hidden',
        'is_active' => false,
    ]);

    $this->get(route('public.umkm.show', $profile))
        ->assertInertia(fn ($page) => $page
            ->where('umkm.products.0.name', 'Visible')
            ->etc(),
        );
});
