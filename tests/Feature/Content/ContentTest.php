<?php

declare(strict_types=1);

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Models\CreatorProfile;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Services\FileUrlService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('local');
});

function makeCollabForContent(): array
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

test('creator can post a progress update', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();

    $this->actingAs($creator)
        ->post(route('creator.collaborations.progress.store', $collab), [
            'message' => 'Sedang syuting video.',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('collaboration_progress_updates', [
        'collaboration_id' => $collab->id,
        'creator_id' => $creator->id,
        'message' => 'Sedang syuting video.',
    ]);
});

test('UMKM cannot post a progress update', function (): void {
    [$umkm, , , $collab] = makeCollabForContent();

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.progress.store', $collab), [
            'message' => 'Test',
        ])
        ->assertForbidden();
});

test('progress update requires a message', function (): void {
    [, $creator, , $collab] = makeCollabForContent();

    $this->actingAs($creator)
        ->from(route('creator.collaborations.show', $collab))
        ->post(route('creator.collaborations.progress.store', $collab), [
            'message' => '',
        ])
        ->assertSessionHasErrors('message');
});

test('creator can upload a content submission v1', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.store', $collab), [
            'title' => 'Photo hasil',
            'description' => 'Foto sudah diedit',
            'files' => [$file],
        ])
        ->assertRedirect();

    $sub = ContentSubmission::where('collaboration_id', $collab->id)->firstOrFail();
    expect($sub->version)->toBe(1)
        ->and($sub->title)->toBe('Photo hasil')
        ->and($sub->status)->toBe(ContentSubmissionStatus::Draft);
    expect($sub->files)->toHaveCount(1);
});

test('uploaded file has mime and size', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();
    $file = UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf');

    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.store', $collab), [
            'title' => 'Spec',
            'files' => [$file],
        ])
        ->assertRedirect();

    $f = ContentSubmissionFile::firstOrFail();
    expect($f->mime_type)->toBe('application/pdf')
        ->and($f->size)->toBeGreaterThan(0)
        ->and($f->original_name)->toBe('doc.pdf');
});

test('creator can submit for review (Draft -> InReview)', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'Draft',
        'status' => ContentSubmissionStatus::Draft,
    ]);

    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.submitForReview', [$collab, $sub]))
        ->assertRedirect();

    $sub->refresh();
    expect($sub->status)->toBe(ContentSubmissionStatus::InReview)
        ->and($sub->submitted_at)->not->toBeNull();
});

test('UMKM can request revision (InReview -> RevisionRequested)', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::InReview,
        'submitted_at' => now(),
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.requestRevision', [$collab, $sub]), [
            'note' => 'Tambah intro 3 detik.',
        ])
        ->assertRedirect();

    $sub->refresh();
    expect($sub->status)->toBe(ContentSubmissionStatus::RevisionRequested);
    expect($sub->revisions)->toHaveCount(1);
});

test('creator can resubmit a new version (RevisionRequested -> Draft, version+1)', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();
    $old = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::RevisionRequested,
    ]);
    $file = UploadedFile::fake()->image('v2.png');

    $response = $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.resubmit', [$collab, $old]), [
            'title' => 'v2 dengan revisi',
            'description' => 'Sudah ditambah intro',
            'files' => [$file],
        ]);

    $response->assertSessionDoesntHaveErrors();
    $response->assertRedirect();

    $old->refresh();
    expect($old->status)->toBe(ContentSubmissionStatus::Superseded);

    $new = $collab->submissions()->where('version', 2)->firstOrFail();
    expect($new->status)->toBe(ContentSubmissionStatus::Draft)
        ->and($new->title)->toBe('v2 dengan revisi')
        ->and($new->files)->toHaveCount(1);
});

test('UMKM can approve a submission (InReview -> Approved)', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::InReview,
        'submitted_at' => now(),
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.approve', [$collab, $sub]))
        ->assertRedirect();

    $sub->refresh();
    expect($sub->status)->toBe(ContentSubmissionStatus::Approved)
        ->and($sub->approved_at)->not->toBeNull();
});

test('approve is rejected if submission is not InReview', function (): void {
    [$umkm, , , $collab] = makeCollabForContent();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::Draft,
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.approve', [$collab, $sub]))
        ->assertSessionHasErrors('submission');
});

test('approved submission cannot revert to draft via request revision', function (): void {
    [, $creator, , $collab] = makeCollabForContent();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::Approved,
        'submitted_at' => now(),
        'approved_at' => now(),
    ]);

    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.submitForReview', [$collab, $sub]))
        ->assertSessionHasErrors('submission');

    $sub->refresh();
    expect($sub->status)->toBe(ContentSubmissionStatus::Approved);
});

test('cannot approve a submission in revision_requested state', function (): void {
    [$umkm, , , $collab] = makeCollabForContent();
    $sub = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::RevisionRequested,
    ]);

    $this->actingAs($umkm)
        ->post(route('umkm.collaborations.submissions.approve', [$collab, $sub]))
        ->assertSessionHasErrors('submission');

    $sub->refresh();
    expect($sub->status)->toBe(ContentSubmissionStatus::RevisionRequested);
});

test('re-submission cannot supersede an already approved submission', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();

    $approved = $collab->submissions()->create([
        'version' => 1,
        'title' => 'v1',
        'status' => ContentSubmissionStatus::Approved,
        'submitted_at' => now(),
        'approved_at' => now(),
    ]);

    $revisionAttempt = $collab->submissions()->create([
        'version' => 2,
        'title' => 'v2 (after approve)',
        'status' => ContentSubmissionStatus::RevisionRequested,
    ]);

    $file = UploadedFile::fake()->image('v3.png');

    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.resubmit', [$collab, $revisionAttempt]), [
            'title' => 'v3 paksa',
            'files' => [$file],
        ])
        ->assertSessionHasErrors('submission');

    expect($collab->submissions()->count())->toBe(2);
    $approved->refresh();
    expect($approved->status)->toBe(ContentSubmissionStatus::Approved);
});

test('content submission file is private and requires a signed URL', function (): void {
    [$umkm, $creator, , $collab] = makeCollabForContent();
    $file = UploadedFile::fake()->create('private.pdf', 50, 'application/pdf');

    $this->actingAs($creator)
        ->post(route('creator.collaborations.submissions.store', $collab), [
            'title' => 'Spec',
            'files' => [$file],
        ])
        ->assertRedirect();

    $subFile = ContentSubmissionFile::firstOrFail();
    $signed = app(FileUrlService::class)->privateUrl($subFile->file_path);

    expect(parse_url($signed, PHP_URL_PATH))->toStartWith('/files/private/');

    // Unsigned (raw) GET to the private path must fail.
    $this->get('/files/private/'.$subFile->file_path)
        ->assertForbidden();

    // Signed GET succeeds.
    $this->get($signed)
        ->assertOk();
});
