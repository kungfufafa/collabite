<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\User;

test('admin can view audit log index', function (): void {
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    ActivityLog::create([
        'actor_id' => $admin->id,
        'actor_role' => 'admin',
        'action' => 'account.suspended',
        'subject_type' => 'User',
        'subject_id' => 99,
        'metadata' => ['actor_name' => 'Admin Collabite'],
        'created_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.audit-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/AuditLogs/Index')
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'account.suspended'),
        );
});

test('admin can search audit logs by action keyword', function (): void {
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);

    ActivityLog::create([
        'actor_id' => $admin->id,
        'actor_role' => 'admin',
        'action' => 'collaboration.force_closed',
        'subject_type' => 'Collaboration',
        'subject_id' => 1,
        'metadata' => null,
        'created_at' => now(),
    ]);

    ActivityLog::create([
        'actor_id' => $admin->id,
        'actor_role' => 'admin',
        'action' => 'campaign.published',
        'subject_type' => 'Campaign',
        'subject_id' => 2,
        'metadata' => null,
        'created_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.audit-logs.index', ['q' => 'force_closed']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'collaboration.force_closed')
            ->where('filters.q', 'force_closed'),
        );
});

test('admin can search audit logs by actor id', function (): void {
    $admin = User::factory()->withRole(UserRole::Admin)->create(['email_verified_at' => now()]);
    $other = User::factory()->withRole(UserRole::Umkm)->create(['email_verified_at' => now()]);

    ActivityLog::create([
        'actor_id' => $admin->id,
        'actor_role' => 'admin',
        'action' => 'verification.approved',
        'subject_type' => null,
        'subject_id' => null,
        'metadata' => null,
        'created_at' => now(),
    ]);

    ActivityLog::create([
        'actor_id' => $other->id,
        'actor_role' => 'umkm',
        'action' => 'campaign.published',
        'subject_type' => null,
        'subject_id' => null,
        'metadata' => null,
        'created_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.audit-logs.index', ['q' => (string) $other->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.actor_id', $other->id),
        );
});

test('guest cannot access audit logs', function (): void {
    $this->get(route('admin.audit-logs.index'))->assertRedirect(route('login'));
});
