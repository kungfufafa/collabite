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

test('umkm users are redirected to umkm dashboard', function (): void {
    $umkm = User::factory()->create(['role' => UserRole::Umkm, 'email_verified_at' => now()]);

    $response = $this->post(route('login'), [
        'email' => $umkm->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('umkm.dashboard', absolute: false));
});

test('disabled users cannot authenticate', function (): void {
    $user = User::factory()->withStatus(AccountStatus::Suspended)->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('login with unknown email fails with validation error', function (): void {
    $response = $this->post(route('login'), [
        'email' => 'nobody-'.uniqid().'@collabite.test',
        'password' => 'whatever',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('login regenerates the session id', function (): void {
    $user = User::factory()->create([
        'role' => UserRole::Umkm,
        'email_verified_at' => now(),
    ]);

    $before = $this->app['session.store']->getId();
    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $after = $this->app['session.store']->getId();

    expect($after)->not->toBe($before);
});

test('authenticated user cannot reopen the guest login page', function (): void {
    $user = User::factory()->create([
        'role' => UserRole::Umkm,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('login'));

    $response->assertRedirect(route('dashboard', absolute: false));
});
