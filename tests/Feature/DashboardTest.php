<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

test('guests are redirected to the login page', function (): void {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('umkm users are redirected to umkm dashboard', function (): void {
    $user = User::factory()->create(['role' => UserRole::Umkm, 'email_verified_at' => now()]);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('umkm.dashboard', absolute: false));
});

test('creator users are redirected to creator dashboard', function (): void {
    $user = User::factory()->create(['role' => UserRole::Creator, 'email_verified_at' => now()]);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('creator.dashboard', absolute: false));
});

test('admin users are redirected to admin dashboard', function (): void {
    $user = User::factory()->create(['role' => UserRole::Admin, 'email_verified_at' => now()]);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('admin.dashboard', absolute: false));
});
