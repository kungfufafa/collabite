<?php

declare(strict_types=1);

use App\Enums\AccountStatus;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CreatorProfile;
use App\Models\Message;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Services\FileUrlService;
use Illuminate\Support\Facades\Storage;

function makeUmkmCreatorCollaboration(): array
{
    $umkm = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($umkm, 'user')->create();
    $creator = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($creator, 'user')->create();
    $category = Category::factory()->create();
    $campaign = Campaign::factory()->create([
        'umkm_profile_id' => $umkm->umkmProfile->id,
        'category_id' => $category->id,
        'status' => CampaignStatus::Open,
        'published_at' => now(),
    ]);
    $collaboration = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkm->id,
        'creator_id' => $creator->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);
    $collaboration->conversation()->create([]);

    return [$umkm, $creator, $campaign, $collaboration];
}

test('UMKM can send a message to their collaboration', function (): void {
    [$umkm, $creator, $campaign, $collab] = makeUmkmCreatorCollaboration();

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.messages.store', $collab), [
            'body' => 'Halo Creator!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $collab->conversation->id,
        'sender_id' => $umkm->id,
        'body' => 'Halo Creator!',
        'is_hidden' => false,
    ]);
});

test('Creator can send a message to their collaboration', function (): void {
    [$umkm, $creator, $campaign, $collab] = makeUmkmCreatorCollaboration();

    $this->actingAs($creator)
        ->post(route('creator.collaborations.messages.store', $collab), [
            'body' => 'Halo UMKM!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $collab->conversation->id,
        'sender_id' => $creator->id,
        'body' => 'Halo UMKM!',
    ]);
});

test('Intruder cannot read or send messages', function (): void {
    [, , , $collab] = makeUmkmCreatorCollaboration();

    $intruder = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($intruder, 'user')->create();

    $this->actingAs($intruder)
        ->post(route('umkm.collaborations.messages.store', $collab), [
            'body' => 'Hi',
        ])
        ->assertForbidden();
});

test('Message read_at is set when the recipient opens the conversation', function (): void {
    [$umkm, $creator, , $collab] = makeUmkmCreatorCollaboration();

    $msg = Message::create([
        'conversation_id' => $collab->conversation->id,
        'sender_id' => $umkm->id,
        'body' => 'A message',
    ]);

    $this->actingAs($creator)
        ->get(route('creator.collaborations.show', $collab))
        ->assertOk();

    $msg->refresh();
    expect($msg->read_at)->not->toBeNull();
});

test('Completed or cancelled collaboration cannot send messages', function (): void {
    [$umkm, $creator, , $collab] = makeUmkmCreatorCollaboration();
    $collab->update([
        'status' => CollaborationStatus::Completed,
        'completed_at' => now(),
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.messages.store', $collab), [
            'body' => 'Trying...',
        ])
        ->assertStatus(422);
});

test('Message body is required', function (): void {
    [$umkm, $creator, , $collab] = makeUmkmCreatorCollaboration();

    $this->actingAs($umkm)
        ->from(route('umkm.collaborations.show', $collab))
        ->post(route('umkm.collaborations.messages.store', $collab), [
            'body' => '',
        ])
        ->assertSessionHasErrors('body');
});

test('outsider cannot send a message to an UMKM collaboration', function (): void {
    [, , , $collab] = makeUmkmCreatorCollaboration();

    $outsider = User::factory()->withRole(UserRole::Umkm)->create();
    UmkmProfile::factory()->for($outsider, 'user')->create();

    $this->actingAs($outsider)
        ->post(route('umkm.collaborations.messages.store', $collab), [
            'body' => 'Saya tidak seharusnya bisa kirim pesan.',
        ])
        ->assertForbidden();
});

test('outsider cannot send a message to a Creator collaboration', function (): void {
    [, , , $collab] = makeUmkmCreatorCollaboration();

    $outsider = User::factory()->withRole(UserRole::Creator)->create();
    CreatorProfile::factory()->for($outsider, 'user')->create();

    $this->actingAs($outsider)
        ->post(route('creator.collaborations.messages.store', $collab), [
            'body' => 'Saya tidak seharusnya bisa kirim pesan.',
        ])
        ->assertForbidden();
});

test('messages are immutable: no PATCH/PUT/DELETE route exists', function (): void {
    $routes = collect(app('router')->getRoutes())
        ->filter(fn ($r) => str_contains($r->uri, 'messages'));

    $mutations = $routes->filter(function ($r): bool {
        return in_array($r->methods()[0] ?? '', ['PATCH', 'PUT', 'DELETE'], true);
    });

    expect($mutations->count())->toBe(0);
});

test('read_at is set when participant opens the collaboration detail', function (): void {
    [$umkm, $creator, , $collab] = makeUmkmCreatorCollaboration();

    $msg = Message::create([
        'conversation_id' => $collab->conversation->id,
        'sender_id' => $umkm->id,
        'body' => 'Belum dibaca',
    ]);
    expect($msg->read_at)->toBeNull();

    $this->actingAs($creator)
        ->get(route('creator.collaborations.show', $collab))
        ->assertOk();

    $msg->refresh();
    expect($msg->read_at)->not->toBeNull();
});

test('suspended UMKM cannot send messages (middleware rejects)', function (): void {
    [$umkm, $creator, , $collab] = makeUmkmCreatorCollaboration();
    $umkm->update(['account_status' => AccountStatus::Suspended]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.messages.store', $collab), [
            'body' => 'Tidak boleh terkirim.',
        ])
        ->assertRedirect(route('login'));
});

test('suspended Creator cannot send messages (middleware rejects)', function (): void {
    [$umkm, $creator, , $collab] = makeUmkmCreatorCollaboration();
    $creator->update(['account_status' => AccountStatus::Suspended]);

    $this->actingAs($creator)
        ->post(route('creator.collaborations.messages.store', $collab), [
            'body' => 'Tidak boleh terkirim.',
        ])
        ->assertRedirect(route('login'));
});

test('message attachment URLs are signed and begin with /files/private/', function (): void {
    [$umkm, $creator, , $collab] = makeUmkmCreatorCollaboration();

    $msg = Message::create([
        'conversation_id' => $collab->conversation->id,
        'sender_id' => $umkm->id,
        'body' => 'Lampiran',
    ]);

    Storage::disk('local')->put(
        'message_attachments/'.$msg->id.'/lampiran.pdf',
        'PDF content',
    );

    $msg->attachments()->create([
        'file_path' => 'message_attachments/'.$msg->id.'/lampiran.pdf',
        'original_name' => 'lampiran.pdf',
        'mime_type' => 'application/pdf',
        'size' => 11,
    ]);

    $this->actingAs($creator)
        ->get(route('creator.collaborations.show', $collab))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Creator/Collaborations/Show')
            ->where('collaboration.messages.0.id', $msg->id)
            ->has('collaboration.messages.0.attachments.0.url'),
        );

    $url = $msg->fresh()->attachments->first()->file_path;
    $signed = app(FileUrlService::class)->privateUrl($url);

    expect($signed)->toStartWith('http')
        ->and(parse_url($signed, PHP_URL_PATH))->toStartWith('/files/private/')
        ->and($signed)->toContain('signature=');
});
