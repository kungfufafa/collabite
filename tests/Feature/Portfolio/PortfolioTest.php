<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\CreatorProfile;
use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('public');
});

test('creator can list their portfolio items', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create();
    PortfolioItem::factory()->for($profile, 'creatorProfile')->count(2)->create();

    $this->actingAs($user)
        ->get(route('creator.portfolio.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Creator/Portfolio/Index'));
});

test('creator can add a portfolio item with image upload', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create();
    $file = UploadedFile::fake()->image('karya.jpg', 800, 600);

    $this->actingAs($user)
        ->post(route('creator.portfolio.store'), [
            'title' => 'Karya Baru',
            'description' => 'Deskripsi',
            'external_url' => 'https://example.com',
            'media' => $file,
        ])
        ->assertRedirect();

    $item = $profile->portfolioItems()->latest('id')->first();
    expect($item)->not->toBeNull();
    expect($item->title)->toBe('Karya Baru');
    expect($item->external_url)->toBe('https://example.com');
    Storage::disk('public')->assertExists($item->media_path);
});

test('portfolio item requires a title', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->from(route('creator.portfolio.index'))
        ->post(route('creator.portfolio.store'), [
            'description' => 'Tanpa judul',
        ])
        ->assertSessionHasErrors('title');
});

test('portfolio image must be an image file', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($user, 'user')->create();
    $bad = UploadedFile::fake()->create('not-image.txt', 10, 'text/plain');

    $this->actingAs($user)
        ->from(route('creator.portfolio.index'))
        ->post(route('creator.portfolio.store'), [
            'title' => 'Judul',
            'media' => $bad,
        ])
        ->assertSessionHasErrors('media');
});

test('creator can add a portfolio item with a video upload (PRD §21)', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create();
    $video = UploadedFile::fake()->create('clip.mp4', 100, 'video/mp4');

    $this->actingAs($user)
        ->post(route('creator.portfolio.store'), [
            'title' => 'Video Reels',
            'description' => 'Hasil syuting',
            'media' => $video,
        ])
        ->assertRedirect();

    $item = $profile->portfolioItems()->latest('id')->first();
    expect($item)->not->toBeNull()
        ->and($item->title)->toBe('Video Reels');
    Storage::disk('public')->assertExists($item->media_path);
});

test('portfolio image over 5 MB is rejected (PRD §21)', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($user, 'user')->create();
    // 6000 KB ~ 6 MB, melebihi limit gambar 5 MB. Fake kecil dengan size dimodifikasi.
    $tooBig = UploadedFile::fake()->create('big.jpg', 6000, 'image/jpeg');

    $this->actingAs($user)
        ->from(route('creator.portfolio.index'))
        ->post(route('creator.portfolio.store'), [
            'title' => 'Besar',
            'media' => $tooBig,
        ])
        ->assertSessionHasErrors('media');

    expect(PortfolioItem::count())->toBe(0);
});

test('portfolio video over 50 MB is rejected (PRD §21)', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($user, 'user')->create();
    // 60000 KB ~ 60 MB, melebihi limit video 50 MB.
    $tooBig = UploadedFile::fake()->create('big.mp4', 60000, 'video/mp4');

    $this->actingAs($user)
        ->from(route('creator.portfolio.index'))
        ->post(route('creator.portfolio.store'), [
            'title' => 'Besar',
            'media' => $tooBig,
        ])
        ->assertSessionHasErrors('media');

    expect(PortfolioItem::count())->toBe(0);
});

test('portfolio media rejects unsupported mime types', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    CreatorProfile::factory()->for($user, 'user')->create();
    $audio = UploadedFile::fake()->create('track.mp3', 100, 'audio/mpeg');

    $this->actingAs($user)
        ->from(route('creator.portfolio.index'))
        ->post(route('creator.portfolio.store'), [
            'title' => 'Audio',
            'media' => $audio,
        ])
        ->assertSessionHasErrors('media');

    expect(PortfolioItem::count())->toBe(0);
});

test('creator can soft delete a portfolio item', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $profile = CreatorProfile::factory()->for($user, 'user')->create();
    $item = PortfolioItem::factory()->for($profile, 'creatorProfile')->create();

    $this->actingAs($user)
        ->delete(route('creator.portfolio.destroy', $item))
        ->assertRedirect();

    expect(PortfolioItem::find($item->id))->toBeNull();
    expect(PortfolioItem::withTrashed()->find($item->id))->not->toBeNull();
});

test('creator cannot delete another creators portfolio item', function (): void {
    $owner = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $other = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);
    $ownerProfile = CreatorProfile::factory()->for($owner, 'user')->create();
    CreatorProfile::factory()->for($other, 'user')->create();
    $item = PortfolioItem::factory()->for($ownerProfile, 'creatorProfile')->create();

    // 'other' tries to delete an item they don't own. Because the route signature
    // uses {portfolioItem} (not scoped to their profile), the controller must enforce
    // ownership and respond with 403; a 404 is also acceptable as long as the item
    // is not deleted.
    $response = $this->actingAs($other)
        ->delete(route('creator.portfolio.destroy', $item));

    expect($response->getStatusCode())->toBeIn([403, 404]);
    expect(PortfolioItem::find($item->id))->not->toBeNull();
});
