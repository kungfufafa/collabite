<?php

declare(strict_types=1);

use App\Enums\CampaignStatus;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;
use App\Models\CollaborationRequest;
use App\Models\CreatorProfile;
use App\Models\Review;
use App\Models\UmkmProfile;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PlatformDataSeeder;
use Illuminate\Support\Facades\DB;

it('produces a realistic 3-month dataset with intact relationships', function (): void {
    $this->seed(PlatformDataSeeder::class);

    // ── Volume dasar ───────────────────────────────────────────────────
    expect(User::where('email', 'like', '%@platform.test')->count())->toBe(94) // 24 UMKM + 70 creator
        ->and(UmkmProfile::count())->toBe(24)
        ->and(CreatorProfile::count())->toBe(70);

    $verification = CreatorProfile::query()
        ->where('verification_status', VerificationStatus::Verified)->count();
    expect($verification)->toBe(45);

    // Campaign: 10 open + 4 reopened-open + 12 in_collab + 15 completed + 2 cancelled + 2 draft = 45.
    expect(DB::table('campaigns')->count())->toBe(45)
        ->and(DB::table('campaigns')->where('status', CampaignStatus::Open->value)->count())->toBe(14)
        ->and(DB::table('campaigns')->where('status', CampaignStatus::InCollaboration->value)->count())->toBe(12)
        ->and(DB::table('campaigns')->where('status', CampaignStatus::Completed->value)->count())->toBe(15)
        ->and(DB::table('campaigns')->where('status', CampaignStatus::Cancelled->value)->count())->toBe(2)
        ->and(DB::table('campaigns')->where('status', CampaignStatus::Draft->value)->count())->toBe(2);

    // 12 active + 15 completed + 4 cancelled = 31 kolaborasi.
    expect(Collaboration::count())->toBe(31)
        ->and(Collaboration::where('status', CollaborationStatus::Active)->count())->toBe(12)
        ->and(Collaboration::where('status', CollaborationStatus::Completed)->count())->toBe(15)
        ->and(Collaboration::where('status', CollaborationStatus::Cancelled)->count())->toBe(4);

    // ── Invariant flow: completed ⇒ ada submission approved + completed_at ──
    Collaboration::where('status', CollaborationStatus::Completed)->each(function (Collaboration $c): void {
        expect($c->completed_at)->not->toBeNull()
            ->and($c->submissions()->where('status', ContentSubmissionStatus::Approved)->exists())->toBeTrue();
    });

    // ── Konsistensi status collab ↔ campaign ───────────────────────────
    Collaboration::where('status', CollaborationStatus::Active)->each(fn (Collaboration $c) => expect($c->campaign->status)->toBe(CampaignStatus::InCollaboration));
    Collaboration::where('status', CollaborationStatus::Completed)->each(fn (Collaboration $c) => expect($c->campaign->status)->toBe(CampaignStatus::Completed));
    // Cancelled collab ⇒ campaign kembali Open (BR-005).
    Collaboration::where('status', CollaborationStatus::Cancelled)->each(function (Collaboration $c): void {
        expect($c->cancelled_at)->not->toBeNull()
            ->and($c->cancelled_by)->not->toBeNull()
            ->and($c->campaign->status)->toBe(CampaignStatus::Open);
    });

    // ── Payment: max satu per collab & status selaras ──────────────────
    expect(CollaborationPayment::count())->toBeLessThanOrEqual(Collaboration::count());
    CollaborationPayment::where('status', PaymentStatus::Confirmed)->each(function (CollaborationPayment $p): void {
        expect($p->confirmed_at)->not->toBeNull()
            ->and($p->confirmed_by)->not->toBeNull()
            ->and($p->collaboration->status)->toBe(CollaborationStatus::Completed);
    });
    CollaborationPayment::whereIn('status', [PaymentStatus::Voided, PaymentStatus::Refunded])->each(function (CollaborationPayment $p): void {
        expect($p->voided_at)->not->toBeNull()
            ->and($p->voided_by)->not->toBeNull()
            ->and($p->collaboration->status)->toBe(CollaborationStatus::Cancelled);
    });
    CollaborationPayment::where('status', PaymentStatus::AwaitingConfirmation)->each(function (CollaborationPayment $p): void {
        expect($p->proof_path)->not->toBeNull()
            ->and($p->submitted_at)->not->toBeNull();
    });

    // ── Review: rating 1–5 & unik per (collab, reviewer) ───────────────
    expect(Review::count())->toBeGreaterThan(0);
    Review::each(fn (Review $r) => expect($r->rating)->toBeGreaterThanOrEqual(1)->toBeLessThanOrEqual(5));
    $dupes = DB::table('reviews')
        ->selectRaw('count(*) as c, collaboration_id, reviewer_id')
        ->groupBy('collaboration_id', 'reviewer_id')
        ->having('c', '>', 1)
        ->count();
    expect($dupes)->toBe(0);

    // ── Agregat rating creator konsisten dengan review ─────────────────
    CreatorProfile::whereHas('user', fn ($q) => $q->where('email', 'like', '%@platform.test'))
        ->each(function (CreatorProfile $profile): void {
            $reviews = Review::query()->where('reviewee_id', $profile->user_id)->where('is_hidden', false);
            $count = (clone $reviews)->count();
            $avg = $count > 0 ? (float) round((float) (clone $reviews)->avg('rating'), 2) : 0.0;

            expect($profile->rating_count)->toBe($count)
                ->and((float) $profile->rating_avg)->toBe($avg);
        });

    // ── Request: unik per (creator, campaign) ──────────────────────────
    $requestDupes = DB::table('collaboration_requests')
        ->selectRaw('count(*) as c, creator_id, campaign_id')
        ->groupBy('creator_id', 'campaign_id')
        ->having('c', '>', 1)
        ->count();
    expect($requestDupes)->toBe(0);
    expect(CollaborationRequest::count())->toBeGreaterThan(0);

    // ── Notifikasi: data.type dikenali frontend & notifiable ada ───────
    $validTypes = [
        'collaboration.force_closed', 'collaboration.cancelled', 'collaboration.completed',
        'collaboration_request.cancelled_by_creator', 'collaboration_request.cancelled_by_umkm',
        'payment.proof_submitted', 'payment.confirmed', 'payment.refunded', 'payment.voided',
        'verification.approved', 'verification.rejected', 'account.suspended', 'account.activated',
    ];
    $notifications = DB::table('notifications')->get();
    expect($notifications->count())->toBeGreaterThan(0);
    foreach ($notifications as $n) {
        $data = json_decode($n->data, true);
        expect($validTypes)->toContain($data['type'] ?? '__none__')
            ->and(User::where('id', $n->notifiable_id)->exists())->toBeTrue();
    }

    // ── Audit log: created_at terisi & actor_role valid ────────────────
    $logs = DB::table('activity_logs')->whereNotNull('created_at')->get();
    expect($logs->count())->toBeGreaterThan(0);
    foreach ($logs as $log) {
        expect($log->actor_role)->toBeIn([UserRole::Admin->value, UserRole::Umkm->value, UserRole::Creator->value])
            ->and($log->created_at)->not->toBeNull();
    }

    // ── Suspended accounts ada ─────────────────────────────────────────
    expect(User::where('account_status', 'suspended')->where('email', 'like', '%@platform.test')->count())->toBeGreaterThanOrEqual(3); // 1 UMKM + 2 creator
});

it('is idempotent: re-running keeps counts stable and ratings consistent', function (): void {
    $this->seed(PlatformDataSeeder::class);
    $firstUsers = User::where('email', 'like', '%@platform.test')->count();
    $firstCollabs = Collaboration::count();
    $firstReviews = Review::count();
    $firstPayments = CollaborationPayment::count();
    $firstNotifications = DB::table('notifications')->count();

    $this->seed(PlatformDataSeeder::class);

    expect(User::where('email', 'like', '%@platform.test')->count())->toBe($firstUsers)
        ->and(Collaboration::count())->toBe($firstCollabs)
        ->and(Review::count())->toBe($firstReviews)
        ->and(CollaborationPayment::count())->toBe($firstPayments)
        ->and(DB::table('notifications')->count())->toBe($firstNotifications);

    // Rating tetap konsisten setelah re-seed.
    CreatorProfile::whereHas('user', fn ($q) => $q->where('email', 'like', '%@platform.test'))
        ->each(function (CreatorProfile $profile): void {
            $reviews = Review::query()->where('reviewee_id', $profile->user_id)->where('is_hidden', false);
            $count = (clone $reviews)->count();
            $avg = $count > 0 ? (float) round((float) (clone $reviews)->avg('rating'), 2) : 0.0;

            expect($profile->rating_count)->toBe($count)
                ->and((float) $profile->rating_avg)->toBe($avg);
        });
});

it('preserves demo walkthrough accounts when run via full DatabaseSeeder', function (): void {
    // DatabaseSeeder menjalankan AdminUser/Category/Skill/DemoData lalu PlatformData.
    // PlatformData hanya membuang baris @platform.test, sehingga akun demo
    // @collabite.test dari DemoDataSeeder tetap utuh (append, bukan replace).
    $this->seed(DatabaseSeeder::class);

    expect(User::where('email', 'admin@collabite.test')->exists())->toBeTrue()
        ->and(User::where('email', 'umkm1@collabite.test')->exists())->toBeTrue()
        ->and(User::where('email', 'creator1@collabite.test')->exists())->toBeTrue()
        // Dan dataset realistis tetap tercipta berdampingan.
        ->and(User::where('email', 'like', '%@platform.test')->count())->toBe(94);
});
