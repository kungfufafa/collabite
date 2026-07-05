<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('guests are redirected from settings pages', function (): void {
    $this->get('/settings/profile')->assertRedirect(route('login'));
    $this->get('/settings/security')->assertRedirect(route('login'));
    $this->get('/settings/appearance')->assertRedirect(route('login'));
});

test('verified users can open settings profile page', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create([
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/settings/profile')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/profile'));
});

test('verified users can open settings security page after confirming password', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create([
        'email_verified_at' => now(),
        'password' => Hash::make('Password123!'),
    ]);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get('/settings/security')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/security'));
});

test('verified users can open settings appearance page', function (): void {
    $user = User::factory()->withRole(UserRole::Admin)->create([
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/settings/appearance')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/appearance'));
});

test('settings root redirects to profile', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create([
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/settings')
        ->assertRedirect('/settings/profile');
});

test('unverified users cannot open settings appearance page', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->unverified()->create();

    $this->actingAs($user)
        ->get('/settings/appearance')
        ->assertRedirect(route('verification.notice'));
});
