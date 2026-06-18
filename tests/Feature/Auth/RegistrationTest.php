<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

test('registration screen can be rendered', function (): void {
    $response = $this->get(route('register'));

    $response->assertOk();
});

it('registers an UMKM with profile', function (): void {
    $response = $this->post(route('register.umkm.store'), [
        'name' => 'Bu Sari',
        'email' => 'sari@umkm.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'business_name' => 'Kopi Sari',
        'business_type' => 'F&B',
    ]);

    $response->assertRedirect(route('verification.notice'));

    $this->assertDatabaseHas('users', [
        'email' => 'sari@umkm.test',
        'role' => UserRole::Umkm->value,
    ]);

    $user = User::where('email', 'sari@umkm.test')->firstOrFail();
    expect($user->umkmProfile)->not->toBeNull();
    expect($user->umkmProfile->business_name)->toBe('Kopi Sari');
});

it('rejects duplicate email for UMKM', function (): void {
    User::factory()->create(['email' => 'duplicate@umkm.test']);

    $this->post(route('register.umkm.store'), [
        'name' => 'A',
        'email' => 'duplicate@umkm.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'business_name' => 'X',
        'business_type' => 'Y',
    ])->assertSessionHasErrors('email');
});

it('rejects mismatched password confirmation', function (): void {
    $this->post(route('register.umkm.store'), [
        'name' => 'A',
        'email' => 'a@b.test',
        'password' => 'password123',
        'password_confirmation' => 'different',
        'business_name' => 'X',
        'business_type' => 'Y',
    ])->assertSessionHasErrors('password');
});

it('registers a creator with profile', function (): void {
    $response = $this->post(route('register.creator.store'), [
        'name' => 'Andi',
        'email' => 'andi@creator.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'city' => 'Bandung',
        'contact_phone' => '08123456789',
    ]);

    $response->assertRedirect(route('verification.notice'));

    $user = User::where('email', 'andi@creator.test')->firstOrFail();
    expect($user->creatorProfile)->not->toBeNull();
    expect($user->creatorProfile->verification_status->value)->toBe('unverified');
});
