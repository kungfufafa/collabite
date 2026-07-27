<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

it('allows admin to download users csv export', function () {
    $admin = User::factory()->withRole(UserRole::Admin)->create([
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('admin.reports.export', ['type' => 'users']));

    $response->assertOk();
    $response->assertHeader('content-disposition');
    expect($response->headers->get('content-disposition'))->toContain('.csv');
    expect($response->streamedContent())->toContain('id,name,email,role,account_status,created_at');
    expect($response->streamedContent())->toContain($admin->email);
});

it('allows admin to download campaigns collaborations and reviews csv', function (string $type, string $headerFragment) {
    $admin = User::factory()->withRole(UserRole::Admin)->create([
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('admin.reports.export', ['type' => $type]));

    $response->assertOk();
    expect($response->streamedContent())->toContain($headerFragment);
})->with([
    'campaigns' => ['campaigns', 'id,title,status,category_id,umkm_id,published_at'],
    'collaborations' => ['collaborations', 'id,campaign_id,umkm_id,creator_id,status'],
    'reviews' => ['reviews', 'id,collaboration_id,reviewer_id,reviewee_id,rating'],
]);

it('forbids non-admin from exporting csv', function () {
    $umkm = User::factory()->withRole(UserRole::Umkm)->create([
        'email_verified_at' => now(),
    ]);

    $this->actingAs($umkm)
        ->get(route('admin.reports.export', ['type' => 'users']))
        ->assertForbidden();
});
