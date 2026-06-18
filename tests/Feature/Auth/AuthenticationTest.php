<?php

declare(strict_types=1);

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use App\Models\User;

test('login screen can be rendered', function (): void {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function (): void {
    $user = User::factory()->create([
        'role' => UserRole::Umkm,
        'email_verified_at' => now(),
    ]);

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('umkm.dashboard', absolute: false));
});

test('users cannot authenticate with invalid password', function (): void {
    $user = User::factory()->create();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('suspended users cannot authenticate', function (): void {
    $user = User::factory()->withStatus(AccountStatus::Suspended)->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('users can logout', function (): void {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('admin users are redirected to admin dashboard', function (): void {
    $admin = User::factory()->create(['role' => UserRole::Admin, 'email_verified_at' => now()]);

    $response = $this->post(route('login'), [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('admin.dashboard', absolute: false));
});

test('creator users are redirected to creator dashboard', function (): void {
    $creator = User::factory()->create(['role' => UserRole::Creator, 'email_verified_at' => now()]);

    $response = $this->post(route('login'), [
        'email' => $creator->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('creator.dashboard', absolute: false));
});
