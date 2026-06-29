<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;
use App\Services\Dashboard\DashboardDataService;

test('umkm dashboard returns efferd-style payload shape', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create();

    $payload = app(DashboardDataService::class)->forUmkm($user);

    expect($payload)
        ->toHaveKeys(['stats', 'profile', 'charts', 'recent_collaborations', 'activity', 'health'])
        ->and($payload['stats'])->toHaveCount(4)
        ->and($payload['charts'])->toHaveKeys(['requests_daily', 'collaborations_daily'])
        ->and($payload['charts']['requests_daily'])->toHaveCount(7);
});

test('creator dashboard returns efferd-style payload shape', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create();

    $payload = app(DashboardDataService::class)->forCreator($user);

    expect($payload)
        ->toHaveKeys([
            'stats',
            'profile',
            'portfolio_completion',
            'charts',
            'recent_collaborations',
            'activity',
            'health',
        ])
        ->and($payload['stats'])->toHaveCount(4)
        ->and($payload['portfolio_completion'])->toHaveKeys(['percent', 'missing']);
});

test('admin dashboard returns efferd-style payload shape', function (): void {
    $payload = app(DashboardDataService::class)->forAdmin();

    expect($payload)
        ->toHaveKeys([
            'stats',
            'summary',
            'charts',
            'recent_activity',
            'moderation_queues',
            'health',
        ])
        ->and($payload['stats'])->toHaveCount(4)
        ->and($payload['moderation_queues'])->toHaveKeys(['verifications', 'campaigns', 'content']);
});

test('umkm dashboard page renders with new props', function (): void {
    $user = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->get(route('umkm.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Umkm/Dashboard/Index')
            ->has('stats', 4)
            ->has('charts.requests_daily', 7)
            ->has('health'));
});

test('creator dashboard page renders with new props', function (): void {
    $user = User::factory()->withRole(UserRole::Creator)->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->get(route('creator.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Creator/Dashboard/Index')
            ->has('stats', 4)
            ->has('portfolio_completion')
            ->has('charts.applications_daily', 7));
});

test('admin dashboard page renders with new props', function (): void {
    $user = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard/Index')
            ->has('stats', 4)
            ->has('moderation_queues.verifications')
            ->has('recent_activity'));
});
