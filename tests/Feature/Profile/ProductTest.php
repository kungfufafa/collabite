<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('public');
});

test('guests are redirected from products index', function (): void {
    $this->get(route('umkm.products.index'))->assertRedirect(route('login'));
});

test('verified UMKM can list their products', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    Product::factory()->for($profile, 'umkmProfile')->count(2)->create();

    $this->actingAs($user)
        ->get(route('umkm.products.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Umkm/Products/Index')
            ->has('products', 2),
        );
});

test('creator cannot access UMKM products index', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create();

    $this->actingAs($user)
        ->get(route('umkm.products.index'))
        ->assertForbidden();
});

test('UMKM can create a product', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->post(route('umkm.products.store'), [
            'name' => 'Keripik Singkong',
            'description' => 'Enak dan renyah',
            'price' => 25000,
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'umkm_profile_id' => $profile->id,
        'name' => 'Keripik Singkong',
        'description' => 'Enak dan renyah',
        'price' => '25000.00',
        'is_active' => true,
    ]);
});

test('UMKM can create a product with image upload', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    $image = UploadedFile::fake()->image('product.png', 400, 400);

    $this->actingAs($user)
        ->post(route('umkm.products.store'), [
            'name' => 'Produk Bergambar',
            'image' => $image,
        ])
        ->assertRedirect();

    $product = Product::where('umkm_profile_id', $profile->id)->firstOrFail();

    expect($product->image_path)->not->toBeNull()
        ->and($product->image_path)->toStartWith("products/{$product->id}/");
    Storage::disk('public')->assertExists($product->image_path);
});

test('store requires a name', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->from(route('umkm.products.index'))
        ->post(route('umkm.products.store'), [
            'name' => '',
        ])
        ->assertSessionHasErrors('name');
});

test('store validates image mimes', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();
    $file = UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->from(route('umkm.products.index'))
        ->post(route('umkm.products.store'), [
            'name' => 'Test',
            'image' => $file,
        ])
        ->assertSessionHasErrors('image');
});

test('store rejects image larger than 2MB', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();
    $file = UploadedFile::fake()->image('big.png')->size(3 * 1024);

    $this->actingAs($user)
        ->from(route('umkm.products.index'))
        ->post(route('umkm.products.store'), [
            'name' => 'Test',
            'image' => $file,
        ])
        ->assertSessionHasErrors('image');
});

test('store validates negative price', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($user, 'user')->create();

    $this->actingAs($user)
        ->from(route('umkm.products.index'))
        ->post(route('umkm.products.store'), [
            'name' => 'Test',
            'price' => -1,
        ])
        ->assertSessionHasErrors('price');
});

test('creator cannot create a product', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create();

    $this->actingAs($user)
        ->post(route('umkm.products.store'), [
            'name' => 'Test',
        ])
        ->assertForbidden();
});

test('UMKM can update their product', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    $product = Product::factory()->for($profile, 'umkmProfile')->create([
        'name' => 'Old',
    ]);

    $this->actingAs($user)
        ->patch(route('umkm.products.update', $product), [
            'name' => 'New',
            'description' => 'Updated',
            'price' => 99000,
            'is_active' => false,
        ])
        ->assertRedirect();

    $product->refresh();

    expect($product->name)->toBe('New')
        ->and($product->description)->toBe('Updated')
        ->and((float) $product->price)->toBe(99000.0)
        ->and($product->is_active)->toBeFalse();
});

test('UMKM can replace product image on update', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    $product = Product::factory()->for($profile, 'umkmProfile')->create([
        'image_path' => "products/{$profile->id}/old.png",
    ]);
    Storage::disk('public')->put("products/{$profile->id}/old.png", 'old');

    $newImage = UploadedFile::fake()->image('new.png', 400, 400);

    $this->actingAs($user)
        ->patch(route('umkm.products.update', $product), [
            'name' => $product->name,
            'image' => $newImage,
        ])
        ->assertRedirect();

    $product->refresh();

    Storage::disk('public')->assertMissing("products/{$profile->id}/old.png");
    Storage::disk('public')->assertExists($product->image_path);
});

test('UMKM cannot update another UMKM product', function (): void {
    $owner = User::factory()->withRole(UserRole::Umkm)->create();
    $ownerProfile = UmkmProfile::factory()->for($owner, 'user')->create();
    $product = Product::factory()->for($ownerProfile, 'umkmProfile')->create();

    $other = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($other, 'user')->create();

    $this->actingAs($other)
        ->patch(route('umkm.products.update', $product), [
            'name' => 'Hacked',
        ])
        ->assertForbidden();
});

test('creator cannot update a product', function (): void {
    $owner = User::factory()->withRole(UserRole::Umkm)->create();
    $ownerProfile = UmkmProfile::factory()->for($owner, 'user')->create();
    $product = Product::factory()->for($ownerProfile, 'umkmProfile')->create();

    $creator = User::factory()->withRole(UserRole::Creator)->create();

    $this->actingAs($creator)
        ->patch(route('umkm.products.update', $product), [
            'name' => 'Hacked',
        ])
        ->assertForbidden();
});

test('UMKM can soft delete their product', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    $product = Product::factory()->for($profile, 'umkmProfile')->create();

    $this->actingAs($user)
        ->delete(route('umkm.products.destroy', $product))
        ->assertRedirect();

    $this->assertSoftDeleted('products', ['id' => $product->id]);
});

test('destroy also removes the stored image', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    $product = Product::factory()->for($profile, 'umkmProfile')->create();
    $product->update([
        'image_path' => "products/{$product->id}/picture.png",
    ]);
    Storage::disk('public')->put("products/{$product->id}/picture.png", 'bytes');

    $this->actingAs($user)
        ->delete(route('umkm.products.destroy', $product))
        ->assertRedirect();

    Storage::disk('public')->assertMissing("products/{$product->id}/picture.png");
});

test('UMKM cannot delete another UMKM product', function (): void {
    $owner = User::factory()->withRole(UserRole::Umkm)->create();
    $ownerProfile = UmkmProfile::factory()->for($owner, 'user')->create();
    $product = Product::factory()->for($ownerProfile, 'umkmProfile')->create();

    $other = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($other, 'user')->create();

    $this->actingAs($other)
        ->delete(route('umkm.products.destroy', $product))
        ->assertForbidden();
});

test('soft deleted products are hidden from index', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();
    $profile = UmkmProfile::factory()->for($user, 'user')->create();
    Product::factory()->for($profile, 'umkmProfile')->create(['name' => 'Live']);
    Product::factory()->for($profile, 'umkmProfile')->create(['name' => 'Gone']);
    Product::factory()->for($profile, 'umkmProfile')->create(['name' => 'Gone'])->delete();

    $this->actingAs($user)
        ->get(route('umkm.products.index'))
        ->assertInertia(fn ($page) => $page
            ->has('products', 2)
            ->where('products.0.name', 'Live'),
        );
});
