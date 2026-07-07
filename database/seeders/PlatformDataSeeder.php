<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Enums\VerificationDocumentType;
use App\Enums\VerificationStatus;
use App\Models\ActivityLog;
use App\Models\Campaign;
use App\Models\CampaignDeliverable;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;
use App\Models\CollaborationProgressUpdate;
use App\Models\CollaborationRequest;
use App\Models\ContentRevision;
use App\Models\ContentSubmission;
use App\Models\ContentSubmissionFile;
use App\Models\Conversation;
use App\Models\CreatorProfile;
use App\Models\CreatorVerification;
use App\Models\CreatorVerificationDocument;
use App\Models\Message;
use App\Models\PortfolioItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Skill;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Notifications\AccountStatusChangedNotification;
use App\Notifications\CollaborationCancelledNotification;
use App\Notifications\CollaborationCompletedNotification;
use App\Notifications\CollaborationForceClosedNotification;
use App\Notifications\PaymentConfirmedNotification;
use App\Notifications\PaymentProofSubmittedNotification;
use App\Notifications\PaymentRefundedNotification;
use App\Notifications\PaymentVoidedNotification;
use App\Notifications\VerificationReviewedNotification;
use Carbon\CarbonInterface;
use Faker\Generator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seeder data realistis mensimulasikan platform Collabite yang sudah berjalan ~3 bulan.
 *
 * Idempotent: setiap run menghapus baris milik seeder ini (ditandai email domain
 * `@platform.test`) lalu meregenerasi — sehingga data demo DemoDataSeeder
 * (akun walkthrough `@collabite.test`) tetap utuh. Aman hanya di `local`/`testing*`.
 *
 * Volume (sedang): ~24 UMKM, ~70 creator, ~45 campaign, ~31 kolaborasi
 * (active/completed/cancelled), request, payment (confirmed/awaiting/voided/refunded),
 * content submission + revision, review mutual, conversation + messages,
 * notifikasi & audit log dengan timeline 3 bulan.
 */
class PlatformDataSeeder extends Seeder
{
    private const DOMAIN = 'platform.test';

    private const UMKM_COUNT = 24;

    private const VERIFIED_COUNT = 45;

    private const PENDING_COUNT = 10;

    private const REJECTED_COUNT = 8;

    private const UNVERIFIED_COUNT = 7;

    private const CAMP_OPEN_PURE = 10;

    private const CAMP_OPEN_REOPENED = 4;

    private const CAMP_IN_COLLAB = 12;

    private const CAMP_COMPLETED = 15;

    private const CAMP_CANCELLED = 2;

    private const CAMP_DRAFT = 2;

    /**
     * Seed faker tetap agar seeder deterministik & idempotent: setiap
     * pemanggilan menghasilkan dataset identik (count, relasi, rating konsisten).
     */
    private const FAKER_SEED = 20260707;

    /** @var array<string, bool> key "creatorId-campaignId" */
    private array $usedPairs = [];

    private Generator $faker;

    public function run(): void
    {
        $env = app()->environment();
        if ($env !== 'local' && ! str_starts_with($env, 'testing')) {
            return;
        }

        $this->faker = fake();
        $this->faker->seed(self::FAKER_SEED);
        // Reset pool unique() Faker agar deterministik antar pemanggilan (factory
        // memakai unique()->safeEmail() pada definition meski di-override).
        $this->faker->unique(true);
        $this->command?->info('PlatformDataSeeder: membangun dataset 3-bulan…');

        DB::transaction(function (): void {
            $this->reset();
            $this->ensurePrerequisites();
            $admin = $this->ensureAdmin();

            $umkms = $this->seedUmkms();
            $creators = $this->seedCreators($admin);

            $campaigns = $this->seedCampaigns($umkms);
            $collabs = $this->seedDealsAndRequests($campaigns, $creators);
            $this->seedCollaborationDetails($collabs, $admin);
            $this->seedReviews($collabs);
            $this->recomputeRatings($creators);

            $this->command?->info(sprintf(
                'PlatformDataSeeder: selesai — %d UMKM, %d creator, %d campaign, %d kolaborasi, %d review.',
                count($umkms),
                count($creators),
                array_sum(array_map('count', $campaigns)),
                count($collabs['active']) + count($collabs['completed']) + count($collabs['cancelled']),
                Review::whereHas('reviewee', fn ($q) => $q->where('email', 'like', '%@'.self::DOMAIN))->count(),
            ));
        });
    }

    /**
     * Hapus baris milik seeder ini. Cascade FK membersihkan profile/campaign/
     * collaboration/payment/review/message/dll. Notifikasi (morph, tidak ada FK)
     * dibersihkan manual sebelum user dihapus.
     */
    private function reset(): void
    {
        $ids = User::where('email', 'like', '%@'.self::DOMAIN)->pluck('id');
        if ($ids->isNotEmpty()) {
            DB::table('notifications')
                ->where('notifiable_type', User::class)
                ->whereIn('notifiable_id', $ids)
                ->delete();
        }
        User::where('email', 'like', '%@'.self::DOMAIN)->delete();
        // ActivityLog actor nullOnDelete; bersihkan log yang subject-nya sudah hilang
        // dan actor-nya seeder ini agar tidak menumpuk.
        DB::table('activity_logs')
            ->whereIn('actor_id', $ids)
            ->delete();
    }

    private function ensurePrerequisites(): void
    {
        if (Category::count() === 0) {
            $this->call(CategorySeeder::class);
        }
        if (Skill::count() === 0) {
            $this->call(SkillSeeder::class);
        }
    }

    private function ensureAdmin(): User
    {
        return User::firstOrCreate(
            ['email' => 'admin@collabite.test'],
            [
                'name' => 'Admin Collabite',
                'password' => 'password',
                'role' => UserRole::Admin,
                'account_status' => AccountStatus::Active,
                'email_verified_at' => now(),
            ],
        );
    }

    // ── UMKM ────────────────────────────────────────────────────────────

    /**
     * @return array<int, array{user: User, profile: UmkmProfile, products: array<int, Product>, suspended: bool, createdAt: Carbon}>
     */
    private function seedUmkms(): array
    {
        $umkms = [];
        $cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Denpasar', 'Malang', 'Medan'];
        $businessTypes = ['Mikro', 'Kecil', 'Menengah'];

        for ($i = 1; $i <= self::UMKM_COUNT; $i++) {
            $createdAt = $this->at(5, 88);
            $suspended = $i === 5;

            $user = User::factory()
                ->withRole(UserRole::Umkm)
                ->withStatus($suspended ? AccountStatus::Suspended : AccountStatus::Active)
                ->create([
                    'name' => $this->faker->name(),
                    'email' => "umkm{$i}@".self::DOMAIN,
                ]);
            $this->stamp($user, $createdAt);

            $profile = UmkmProfile::factory()->create([
                'user_id' => $user->id,
                'business_name' => $this->faker->company(),
                'business_type' => $this->faker->randomElement($businessTypes),
                'city' => $this->faker->randomElement($cities),
                'contact_email' => "umkm{$i}@".self::DOMAIN,
                'website_url' => $this->faker->optional(0.6)->url(),
            ]);
            $this->stamp($profile, $createdAt);

            $products = [];
            $productCount = $this->faker->numberBetween(0, 4);
            for ($p = 1; $p <= $productCount; $p++) {
                $prod = Product::factory()->create(['umkm_profile_id' => $profile->id]);
                $this->stamp($prod, $this->at(0, 80));
                $products[] = $prod;
            }

            if ($suspended) {
                $this->logAt($this->ensureAdmin(), 'account.suspended', $user, $this->at(2, 20), ['reason' => 'Pelanggaran ketentuan platform.']);
            }

            $umkms[] = ['user' => $user, 'profile' => $profile, 'products' => $products, 'suspended' => $suspended, 'createdAt' => $createdAt];
        }

        return $umkms;
    }

    // ── Creators ────────────────────────────────────────────────────────

    /**
     * @return array<int, array{user: User, profile: CreatorProfile, verified: bool}>
     */
    private function seedCreators(User $admin): array
    {
        $creators = [];
        $cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Denpasar', 'Malang', 'Medan'];
        $headlines = [
            'Food & Lifestyle Creator', 'Product Photography', 'Beauty & Skincare Creator',
            'Videographer Cinematic', 'Short-form Video Specialist', 'Travel Storyteller',
            'Fashion Content Creator', 'Tech Reviewer', 'Copywriter & Strategist Konten',
            'Motion Graphics Designer', 'Voice Over & Narration', 'Infographics & Edukasi',
        ];
        $categories = Category::all();
        $skills = Skill::all();

        // Status verifikasi per index.
        $plan = [];
        for ($i = 1; $i <= self::VERIFIED_COUNT; $i++) {
            $plan[] = VerificationStatus::Verified;
        }
        for ($i = 1; $i <= self::PENDING_COUNT; $i++) {
            $plan[] = VerificationStatus::Pending;
        }
        for ($i = 1; $i <= self::REJECTED_COUNT; $i++) {
            $plan[] = VerificationStatus::Rejected;
        }
        for ($i = 1; $i <= self::UNVERIFIED_COUNT; $i++) {
            $plan[] = VerificationStatus::Unverified;
        }

        $verifiedAdmin = $admin;
        $i = 0;
        foreach ($plan as $status) {
            $i++;
            $createdAt = $this->at(5, 88);
            $suspended = ($i === 4 && $status === VerificationStatus::Verified)
                || ($i === self::VERIFIED_COUNT + 1 && $status === VerificationStatus::Pending);

            $user = User::factory()
                ->withRole(UserRole::Creator)
                ->withStatus($suspended ? AccountStatus::Suspended : AccountStatus::Active)
                ->create([
                    'name' => $this->faker->name(),
                    'email' => "creator{$i}@".self::DOMAIN,
                ]);
            $this->stamp($user, $createdAt);

            $profile = CreatorProfile::factory()->create([
                'user_id' => $user->id,
                'headline' => $this->faker->randomElement($headlines),
                'bio' => $this->faker->paragraph(),
                'city' => $this->faker->randomElement($cities),
                'contact_email' => "creator{$i}@".self::DOMAIN,
                'verification_status' => $status,
                'rating_avg' => 0,
                'rating_count' => 0,
            ]);
            $this->stamp($profile, $createdAt);

            // Kategori & skill.
            $catCount = min($this->faker->numberBetween(1, 3), $categories->count());
            $profile->categories()->syncWithoutDetaching($categories->random($catCount)->modelKeys());
            $skillCount = min($this->faker->numberBetween(2, 4), $skills->count());
            $profile->skills()->syncWithoutDetaching($skills->random($skillCount)->modelKeys());

            // Portofolio.
            $portfolioCount = match ($status) {
                VerificationStatus::Verified => $this->faker->numberBetween(3, 6),
                VerificationStatus::Pending => $this->faker->numberBetween(1, 3),
                VerificationStatus::Rejected => $this->faker->numberBetween(1, 2),
                VerificationStatus::Unverified => $this->faker->numberBetween(0, 2),
            };
            for ($p = 1; $p <= $portfolioCount; $p++) {
                $item = PortfolioItem::factory()->create([
                    'creator_profile_id' => $profile->id,
                    'display_order' => $p,
                    'external_url' => $this->faker->optional(0.7)->url(),
                ]);
                $this->stamp($item, $this->at(0, 80));
            }

            // Verifikasi record + dokumen + audit + notifikasi.
            $this->seedVerification($profile, $user, $status, $verifiedAdmin, $createdAt);

            if ($suspended) {
                $this->logAt($verifiedAdmin, 'account.suspended', $user, $this->at(2, 18), ['reason' => 'Pelanggaran ketentuan platform.']);
                $this->notify(
                    $user,
                    AccountStatusChangedNotification::class,
                    ['type' => 'account.suspended', 'new_status' => AccountStatus::Suspended->value, 'reason' => 'Pelanggaran ketentuan platform.'],
                    $this->at(2, 18),
                    true,
                );
            }

            $creators[] = ['user' => $user, 'profile' => $profile, 'verified' => $status === VerificationStatus::Verified];
        }

        return $creators;
    }

    private function seedVerification(CreatorProfile $profile, User $user, VerificationStatus $status, User $admin, Carbon $createdAt): void
    {
        if ($status === VerificationStatus::Unverified) {
            return;
        }

        $submittedAt = $createdAt->copy()->addDays($this->faker->numberBetween(1, 4));

        if ($status === VerificationStatus::Pending) {
            $verification = CreatorVerification::factory()->pending()->create([
                'creator_profile_id' => $profile->id,
                'submitted_at' => $submittedAt,
            ]);
            $this->stamp($verification, $submittedAt);
            $this->seedVerificationDocuments($verification);

            return;
        }

        $reviewedAt = $submittedAt->copy()->addDays($this->faker->numberBetween(2, 12));

        if ($status === VerificationStatus::Verified) {
            $verification = CreatorVerification::factory()->verified()->create([
                'creator_profile_id' => $profile->id,
                'submitted_at' => $submittedAt,
                'reviewed_at' => $reviewedAt,
                'reviewed_by' => $admin->id,
            ]);
            $this->stamp($verification, $reviewedAt);
            $this->seedVerificationDocuments($verification);
            $this->logAt($admin, 'verification.approved', $verification, $reviewedAt);
            $this->notify(
                $user,
                VerificationReviewedNotification::class,
                ['type' => 'verification.approved', 'verification_id' => $verification->id, 'status' => VerificationStatus::Verified->value, 'rejection_reason' => null],
                $reviewedAt,
                true,
            );

            return;
        }

        // Rejected.
        $reason = $this->faker->randomElement([
            'Foto KTP tidak jelas.',
            'Dokumen portofolio tidak memadai.',
            'Identitas tidak terbaca, mohon unggah ulang.',
        ]);
        $verification = CreatorVerification::factory()->rejected()->create([
            'creator_profile_id' => $profile->id,
            'submitted_at' => $submittedAt,
            'reviewed_at' => $reviewedAt,
            'reviewed_by' => $admin->id,
            'rejection_reason' => $reason,
        ]);
        $this->stamp($verification, $reviewedAt);
        $this->seedVerificationDocuments($verification);
        $this->logAt($admin, 'verification.rejected', $verification, $reviewedAt);
        $this->notify(
            $user,
            VerificationReviewedNotification::class,
            ['type' => 'verification.rejected', 'verification_id' => $verification->id, 'status' => VerificationStatus::Rejected->value, 'rejection_reason' => $reason],
            $reviewedAt,
            false,
        );
    }

    private function seedVerificationDocuments(CreatorVerification $verification): void
    {
        $doc = CreatorVerificationDocument::factory()->create([
            'creator_verification_id' => $verification->id,
            'type' => VerificationDocumentType::IdentityCard,
        ]);
        $this->stamp($doc, $verification->submitted_at);

        if ($this->faker->boolean(40)) {
            $proof = CreatorVerificationDocument::factory()->portfolioProof()->create([
                'creator_verification_id' => $verification->id,
            ]);
            $this->stamp($proof, $verification->submitted_at);
        }
    }

    // ── Campaigns ───────────────────────────────────────────────────────

    /**
     * @param  array<int, array{user: User, profile: UmkmProfile}>  $umkms
     * @return array<string, array<int, array{campaign: Campaign, umkm: User, kind: string}>>
     */
    private function seedCampaigns(array $umkms): array
    {
        $categories = Category::all();
        $groups = ['openPure' => [], 'openReopened' => [], 'inCollaboration' => [], 'completed' => [], 'cancelled' => [], 'draft' => []];
        $usage = array_fill(0, count($umkms), 0);

        $specs = [
            ['kind' => 'openPure', 'count' => self::CAMP_OPEN_PURE, 'status' => CampaignStatus::Open],
            ['kind' => 'openReopened', 'count' => self::CAMP_OPEN_REOPENED, 'status' => CampaignStatus::Open],
            ['kind' => 'inCollaboration', 'count' => self::CAMP_IN_COLLAB, 'status' => CampaignStatus::InCollaboration],
            ['kind' => 'completed', 'count' => self::CAMP_COMPLETED, 'status' => CampaignStatus::Completed],
            ['kind' => 'cancelled', 'count' => self::CAMP_CANCELLED, 'status' => CampaignStatus::Cancelled],
            ['kind' => 'draft', 'count' => self::CAMP_DRAFT, 'status' => CampaignStatus::Draft],
        ];

        foreach ($specs as $spec) {
            for ($c = 0; $c < $spec['count']; $c++) {
                $idx = $this->pickLowUsageIndex($usage);
                $usage[$idx]++;
                $umkm = $umkms[$idx];
                $groups[$spec['kind']][] = $this->createCampaign($umkm, $categories->random(), $spec['kind'], $spec['status']);
            }
        }

        return $groups;
    }

    /**
     * @param  array{user: User, profile: UmkmProfile}  $umkm
     * @return array{campaign: Campaign, umkm: User, kind: string}
     */
    private function createCampaign(array $umkm, Category $category, string $kind, CampaignStatus $status): array
    {
        $budget = $this->faker->numberBetween(800_000, 12_000_000);

        $publishedAt = match ($kind) {
            'openPure' => $this->at(1, 14),
            'openReopened' => $this->at(42, 70),
            'inCollaboration' => $this->at(21, 56),
            'completed' => $this->at(56, 84),
            'cancelled' => $this->at(28, 56),
            'draft' => null,
        };

        $deadline = match ($kind) {
            'openPure', 'inCollaboration' => Carbon::now()->addWeeks($this->faker->numberBetween(2, 6))->toDateString(),
            'openReopened' => Carbon::now()->addWeeks($this->faker->numberBetween(1, 3))->toDateString(),
            'completed' => $this->at(28, 56)->toDateString(),
            'cancelled' => $publishedAt?->copy()->addWeeks($this->faker->numberBetween(2, 4))->toDateString(),
            'draft' => Carbon::now()->addWeeks($this->faker->numberBetween(3, 8))->toDateString(),
        };

        $campaign = Campaign::factory()->create([
            'umkm_profile_id' => $umkm['profile']->id,
            'category_id' => $category->id,
            'title' => $this->campaignTitle(),
            'description' => $this->faker->paragraphs(2, true),
            'budget' => $budget,
            'deadline' => $deadline,
            'status' => $status,
            'is_hidden' => $kind === 'draft',
            'published_at' => $publishedAt,
        ]);
        $this->stamp($campaign, $publishedAt ?? $this->at(0, 10));

        // Deliverables.
        $deliverableCount = $this->faker->numberBetween(1, 4);
        for ($d = 1; $d <= $deliverableCount; $d++) {
            $del = CampaignDeliverable::factory()->create(['campaign_id' => $campaign->id]);
            $this->stamp($del, $campaign->created_at);
        }

        if ($publishedAt !== null && $kind !== 'cancelled') {
            $this->logAt($umkm['user'], 'campaign.published', $campaign, $publishedAt);
        }
        if ($kind === 'cancelled' && $publishedAt !== null) {
            $cancelledAt = $publishedAt->copy()->addDays($this->faker->numberBetween(5, 20));
            $this->logAt($umkm['user'], 'campaign.cancelled', $campaign, $cancelledAt);
        }

        return ['campaign' => $campaign, 'umkm' => $umkm['user'], 'kind' => $kind];
    }

    private function campaignTitle(): string
    {
        $verbs = ['Promo', 'Launching', 'Showcase', 'Kampanye', 'Brand Awareness', 'Review', 'Endorsement', 'Lookbook'];
        $objects = ['Produk Baru', 'Koleksi Musim', 'Menu Spesial', 'Paket Hemat', 'Series Konten', 'Opening Cabang', 'Grand Promo'];

        return $this->faker->randomElement($verbs).' '.$this->faker->randomElement($objects).' '.$this->faker->city();
    }

    // ── Deals (collaborations + requests) ───────────────────────────────

    /**
     * @param  array<string, array<int, array{campaign: Campaign, umkm: User, kind: string}>>  $campaigns
     * @param  array<int, array{user: User, profile: CreatorProfile, verified: bool}>  $creators
     * @return array{active: array<int, array>, completed: array<int, array>, cancelled: array<int, array>}
     */
    private function seedDealsAndRequests(array $campaigns, array $creators): array
    {
        $collabs = ['active' => [], 'completed' => [], 'cancelled' => []];

        // Active collaborations (InCollaboration campaigns).
        foreach ($campaigns['inCollaboration'] as $row) {
            $creator = $this->pickCreatorFor($row['campaign']->id, $creators);
            if ($creator === null) {
                continue;
            }
            $startedAt = $this->at(1, 14);
            $collab = $this->createCollaboration($row, $creator, CollaborationStatus::Active, $startedAt, null);
            $this->createAcceptedRequest($row, $creator, $startedAt);
            $this->addCompetingRequests($row, $creator, $creators, 2);
            $collabs['active'][] = ['collaboration' => $collab, 'umkm' => $row['umkm'], 'creator' => $creator['user'], 'campaign' => $row['campaign'], 'kind' => 'active'];
        }

        // Completed collaborations.
        foreach ($campaigns['completed'] as $row) {
            $creator = $this->pickCreatorFor($row['campaign']->id, $creators);
            if ($creator === null) {
                continue;
            }
            $startedAt = $this->at(50, 88);
            $collab = $this->createCollaboration($row, $creator, CollaborationStatus::Completed, $startedAt, null);
            $this->createAcceptedRequest($row, $creator, $startedAt);
            $this->addCompetingRequests($row, $creator, $creators, 2);
            $collabs['completed'][] = ['collaboration' => $collab, 'umkm' => $row['umkm'], 'creator' => $creator['user'], 'campaign' => $row['campaign'], 'kind' => 'completed'];
        }

        // Cancelled collaborations on reopened-Open campaigns.
        foreach ($campaigns['openReopened'] as $row) {
            $creator = $this->pickCreatorFor($row['campaign']->id, $creators);
            if ($creator === null) {
                continue;
            }
            $startedAt = $this->at(20, 40);
            $collab = $this->createCollaboration($row, $creator, CollaborationStatus::Cancelled, $startedAt, null);
            $this->createAcceptedRequest($row, $creator, $startedAt);
            $this->addCompetingRequests($row, $creator, $creators, 1);
            $collabs['cancelled'][] = ['collaboration' => $collab, 'umkm' => $row['umkm'], 'creator' => $creator['user'], 'campaign' => $row['campaign'], 'kind' => 'cancelled'];
        }

        // Pure open campaigns: applications only.
        foreach ($campaigns['openPure'] as $row) {
            $this->addOpenApplications($row, $creators, 2, 4);
        }
        // Withdrawn campaigns: a few pending/rejected applications.
        foreach ($campaigns['cancelled'] as $row) {
            $this->addOpenApplications($row, $creators, 0, 2);
        }

        return $collabs;
    }

    /**
     * @param  array{campaign: Campaign, umkm: User, kind: string}  $row
     * @param  array{user: User, profile: CreatorProfile, verified: bool}  $creator
     */
    private function createCollaboration(array $row, array $creator, CollaborationStatus $status, Carbon $startedAt, ?Carbon $endedAt): Collaboration
    {
        $collab = Collaboration::factory()->create([
            'campaign_id' => $row['campaign']->id,
            'umkm_id' => $row['umkm']->id,
            'creator_id' => $creator['user']->id,
            'status' => $status,
            'started_at' => $startedAt,
            'completed_at' => $endedAt,
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancelled_reason' => null,
        ]);
        $this->stamp($collab, $startedAt);
        $this->markPair($creator['user']->id, $row['campaign']->id);

        return $collab;
    }

    /**
     * @param  array{campaign: Campaign, umkm: User, kind: string}  $row
     * @param  array{user: User, profile: CreatorProfile, verified: bool}  $creator
     */
    private function createAcceptedRequest(array $row, array $creator, Carbon $acceptedAt): void
    {
        $type = $this->faker->boolean(70)
            ? CollaborationRequestType::Application
            : CollaborationRequestType::Invitation;
        $senderId = $type === CollaborationRequestType::Application
            ? $creator['user']->id
            : $row['umkm']->id;

        $request = CollaborationRequest::factory()->accepted()->create([
            'campaign_id' => $row['campaign']->id,
            'creator_id' => $creator['user']->id,
            'sender_id' => $senderId,
            'type' => $type,
            'message' => $this->requestMessage($type),
            'responded_at' => $acceptedAt,
        ]);
        $this->stamp($request, $acceptedAt->copy()->subDays($this->faker->numberBetween(1, 4)));
        $this->markPair($creator['user']->id, $row['campaign']->id);

        $acceptor = $type === CollaborationRequestType::Application ? $row['umkm'] : $creator['user'];
        $this->logAt($acceptor, 'collaboration.accepted', $row['campaign'], $acceptedAt, ['creator_id' => $creator['user']->id]);
    }

    /**
     * @param  array{campaign: Campaign, umkm: User, kind: string}  $row
     * @param  array{user: User, profile: CreatorProfile, verified: bool}  $acceptedCreator
     * @param  array<int, array{user: User, profile: CreatorProfile, verified: bool}>  $creators
     */
    private function addCompetingRequests(array $row, array $acceptedCreator, array $creators, int $max): void
    {
        $extra = $this->faker->numberBetween(0, $max);
        $shuffled = $this->faker->shuffle($creators);
        $added = 0;
        foreach ($shuffled as $creator) {
            if ($added >= $extra) {
                break;
            }
            if ($creator['user']->is($acceptedCreator['user'])) {
                continue;
            }
            if ($this->pairUsed($creator['user']->id, $row['campaign']->id)) {
                continue;
            }
            $status = $this->faker->boolean(60) ? CollaborationRequestStatus::Rejected : CollaborationRequestStatus::Pending;
            $this->createRequest($row, $creator, CollaborationRequestType::Application, $status, $this->at(15, 60));
            $added++;
        }
    }

    /**
     * @param  array{campaign: Campaign, umkm: User, kind: string}  $row
     * @param  array<int, array{user: User, profile: CreatorProfile, verified: bool}>  $creators
     */
    private function addOpenApplications(array $row, array $creators, int $min, int $max): void
    {
        $count = $this->faker->numberBetween($min, $max);
        $shuffled = $this->faker->shuffle($creators);
        $added = 0;
        foreach ($shuffled as $creator) {
            if ($added >= $count) {
                break;
            }
            if ($this->pairUsed($creator['user']->id, $row['campaign']->id)) {
                continue;
            }
            $status = $this->faker->boolean(75) ? CollaborationRequestStatus::Pending : CollaborationRequestStatus::Rejected;
            $this->createRequest($row, $creator, CollaborationRequestType::Application, $status, $this->at(0, 13));
            $added++;
        }
    }

    /**
     * @param  array{campaign: Campaign, umkm: User, kind: string}  $row
     * @param  array{user: User, profile: CreatorProfile, verified: bool}  $creator
     */
    private function createRequest(array $row, array $creator, CollaborationRequestType $type, CollaborationRequestStatus $status, Carbon $at): void
    {
        $senderId = $type === CollaborationRequestType::Application ? $creator['user']->id : $row['umkm']->id;
        $request = CollaborationRequest::factory()->create([
            'campaign_id' => $row['campaign']->id,
            'creator_id' => $creator['user']->id,
            'sender_id' => $senderId,
            'type' => $type,
            'status' => $status,
            'message' => $this->requestMessage($type),
            'responded_at' => $status === CollaborationRequestStatus::Pending ? null : $at->copy()->addDays($this->faker->numberBetween(1, 3)),
        ]);
        $this->stamp($request, $at);
        $this->markPair($creator['user']->id, $row['campaign']->id);
    }

    private function requestMessage(CollaborationRequestType $type): string
    {
        return $type === CollaborationRequestType::Application
            ? $this->faker->randomElement([
                'Saya tertarik dengan brief ini, portofolio relevan saya lampirkan di profile.',
                'Audience saya cocok dengan target market brand Anda.',
                'Pernah handle campaign serupa, hasilnya naik engagement 2x.',
                'Tertarik kolaborasi, mohon info detail deliverables-nya.',
            ])
            : $this->faker->randomElement([
                'Kami tertarik dengan portofolio Anda, mau undang untuk campaign ini?',
                'Profil Anda cocok dengan brand kami. Apakah bersedia kolaborasi?',
                'Kami punya budget sesuai, tertarik mengundang Anda.',
            ]);
    }

    // ── Collaboration details ───────────────────────────────────────────

    /**
     * @param  array{active: array<int, array>, completed: array<int, array>, cancelled: array<int, array>}  $collabs
     */
    private function seedCollaborationDetails(array $collabs, User $admin): void
    {
        foreach ($collabs['active'] as $entry) {
            $this->buildActiveCollaboration($entry);
        }
        foreach ($collabs['completed'] as $entry) {
            $this->buildCompletedCollaboration($entry);
        }
        foreach ($collabs['cancelled'] as $entry) {
            $this->buildCancelledCollaboration($entry, $admin);
        }
    }

    /** @param  array{collaboration: Collaboration, umkm: User, creator: User, campaign: Campaign}  $entry */
    private function buildActiveCollaboration(array $entry): void
    {
        $collab = $entry['collaboration'];
        $umkm = $entry['umkm'];
        $creator = $entry['creator'];
        $startedAt = Carbon::instance($collab->started_at);

        $this->createConversation($collab, $umkm, $creator, $startedAt, Carbon::now(), $this->faker->numberBetween(4, 10));
        $this->createProgressUpdates($collab, $creator, $startedAt, Carbon::now(), $this->faker->numberBetween(1, 2));

        // Content submission in-progress.
        $status = $this->faker->randomElement([
            ContentSubmissionStatus::Draft,
            ContentSubmissionStatus::InReview,
            ContentSubmissionStatus::InReview,
            ContentSubmissionStatus::RevisionRequested,
        ]);
        $submittedAt = $status === ContentSubmissionStatus::Draft ? null : $startedAt->copy()->addDays($this->faker->numberBetween(2, 10));
        $submission = ContentSubmission::factory()->create([
            'collaboration_id' => $collab->id,
            'version' => 1,
            'status' => $status,
            'submitted_at' => $submittedAt,
            'approved_at' => null,
        ]);
        $this->stamp($submission, $submittedAt ?? $startedAt->copy()->addDay());
        if ($status !== ContentSubmissionStatus::Draft) {
            $this->addSubmissionFiles($submission);
        }
        if ($status === ContentSubmissionStatus::RevisionRequested) {
            $this->addRevision($submission, $umkm, $submittedAt);
        }

        // Payment: awaiting confirmation / pending proof / none.
        $roll = $this->faker->numberBetween(1, 100);
        if ($roll <= 50) {
            $proofAt = $startedAt->copy()->addDays($this->faker->numberBetween(2, 10));
            $this->createPaymentProofSubmitted($collab, $umkm, $creator, $proofAt, PaymentStatus::AwaitingConfirmation);
        } elseif ($roll <= 80) {
            $this->createPayment($collab, PaymentStatus::PendingProof, null, null, null);
        }
    }

    /** @param  array{collaboration: Collaboration, umkm: User, creator: User, campaign: Campaign}  $entry */
    private function buildCompletedCollaboration(array $entry): void
    {
        $collab = $entry['collaboration'];
        $umkm = $entry['umkm'];
        $creator = $entry['creator'];
        $startedAt = Carbon::instance($collab->started_at);

        // Timeline: content → approve → payment proof → confirm → complete.
        $v1SubmittedAt = $startedAt->copy()->addDays($this->faker->numberBetween(7, 16));
        $useRevisionPath = $this->faker->boolean(40);

        if ($useRevisionPath) {
            $v1 = ContentSubmission::factory()->superseded()->create([
                'collaboration_id' => $collab->id,
                'version' => 1,
                'submitted_at' => $v1SubmittedAt,
            ]);
            $this->stamp($v1, $v1SubmittedAt);
            $this->addSubmissionFiles($v1);
            $this->addRevision($v1, $umkm, $v1SubmittedAt);

            $v2SubmittedAt = $v1SubmittedAt->copy()->addDays($this->faker->numberBetween(4, 8));
            $approvedAt = $v2SubmittedAt->copy()->addDays($this->faker->numberBetween(2, 6));
            $v2 = ContentSubmission::factory()->approved()->create([
                'collaboration_id' => $collab->id,
                'version' => 2,
                'submitted_at' => $v2SubmittedAt,
                'approved_at' => $approvedAt,
            ]);
            $this->stamp($v2, $approvedAt);
            $this->addSubmissionFiles($v2);
        } else {
            $approvedAt = $v1SubmittedAt->copy()->addDays($this->faker->numberBetween(3, 8));
            $v1 = ContentSubmission::factory()->approved()->create([
                'collaboration_id' => $collab->id,
                'version' => 1,
                'submitted_at' => $v1SubmittedAt,
                'approved_at' => $approvedAt,
            ]);
            $this->stamp($v1, $approvedAt);
            $this->addSubmissionFiles($v1);
        }

        $this->logAt($umkm, 'content.approved', $collab, $approvedAt);

        // Payment: proof submitted (UMKM) → confirmed (Creator).
        $proofAt = $approvedAt->copy()->addDays($this->faker->numberBetween(1, 3));
        $confirmedAt = $proofAt->copy()->addDays($this->faker->numberBetween(2, 5));
        $this->createPaymentProofSubmitted($collab, $umkm, $creator, $proofAt, PaymentStatus::AwaitingConfirmation);
        $this->confirmPayment($collab, $creator, $umkm, $confirmedAt);

        // Completion.
        $completedAt = $confirmedAt->copy()->addDays($this->faker->numberBetween(1, 4));
        $collab->forceFill(['completed_at' => $completedAt])->save();
        $this->logAt($umkm, 'collaboration.completed', $collab, $completedAt, ['campaign_id' => $collab->campaign_id, 'creator_id' => $creator->id]);
        $this->notify(
            $creator,
            CollaborationCompletedNotification::class,
            ['type' => 'collaboration.completed', 'collaboration_id' => $collab->id, 'campaign_title' => $entry['campaign']->title, 'completed_by_name' => $umkm->name],
            $completedAt,
            $this->faker->boolean(60),
        );

        $this->createConversation($collab, $umkm, $creator, $startedAt, $completedAt, $this->faker->numberBetween(6, 14));
        $this->createProgressUpdates($collab, $creator, $startedAt, $completedAt, $this->faker->numberBetween(2, 4));
    }

    /** @param  array{collaboration: Collaboration, umkm: User, creator: User, campaign: Campaign}  $entry */
    private function buildCancelledCollaboration(array $entry, User $admin): void
    {
        $collab = $entry['collaboration'];
        $umkm = $entry['umkm'];
        $creator = $entry['creator'];
        $startedAt = Carbon::instance($collab->started_at);
        $cancelledAt = $startedAt->copy()->addDays($this->faker->numberBetween(5, 20));
        if ($cancelledAt->isFuture()) {
            $cancelledAt = Carbon::now()->subDay();
        }

        $canceller = $this->faker->boolean(60) ? $umkm : $creator;
        $reason = $this->faker->randomElement([
            'Creator tidak responsif.',
            'Brief berubah drastis, deal disepakati berhenti.',
            'Budget UMKM terpotong, tidak bisa lanjut.',
            'Jadwal bentrok.',
        ]);
        $collab->forceFill([
            'cancelled_at' => $cancelledAt,
            'cancelled_by' => $canceller->id,
            'cancelled_reason' => $reason,
        ])->save();

        // Slot ke-i di antara cancelled collabs menentukan skenario payment.
        static $slot = 0;
        $slot++;
        $paymentScenario = match ($slot % 4) {
            1 => 'refunded',
            2, 3 => 'voided',
            default => 'none',
        };

        if ($paymentScenario === 'refunded') {
            // Force-close admin: payment sempat confirmed lalu direfund.
            $proofAt = $startedAt->copy()->addDays($this->faker->numberBetween(3, 8));
            $this->createPaymentProofSubmitted($collab, $umkm, $creator, $proofAt, PaymentStatus::AwaitingConfirmation);
            $confirmedAt = $proofAt->copy()->addDays($this->faker->numberBetween(2, 4));
            $this->confirmPayment($collab, $creator, $umkm, $confirmedAt);
            $this->refundPayment($collab, $admin, $cancelledAt, 'Force-close oleh admin: '.$reason);
            $this->logAt($admin, 'collaboration.force_closed', $collab, $cancelledAt, ['reason' => $reason]);
            $this->notify(
                $creator,
                CollaborationForceClosedNotification::class,
                ['type' => 'collaboration.force_closed', 'collaboration_id' => $collab->id, 'campaign_title' => $entry['campaign']->title, 'reason' => $reason],
                $cancelledAt,
                false,
            );
        } elseif ($paymentScenario === 'voided') {
            $proofAt = $startedAt->copy()->addDays($this->faker->numberBetween(3, 8));
            if ($proofAt < $cancelledAt) {
                $this->createPaymentProofSubmitted($collab, $umkm, $creator, $proofAt, PaymentStatus::AwaitingConfirmation);
                $this->voidPayment($collab, $canceller, $cancelledAt, 'Kolaborasi dibatalkan. '.$reason);
                $this->logAt($canceller, 'collaboration.cancelled', $collab, $cancelledAt, ['reason' => $reason]);
                $otherParty = $canceller->is($umkm) ? $creator : $umkm;
                $this->notify(
                    $otherParty,
                    CollaborationCancelledNotification::class,
                    ['type' => 'collaboration.cancelled', 'collaboration_id' => $collab->id, 'campaign_title' => $entry['campaign']->title, 'cancelled_by_name' => $canceller->name, 'reason' => $reason],
                    $cancelledAt,
                    $this->faker->boolean(50),
                );
            } else {
                $this->logAt($canceller, 'collaboration.cancelled', $collab, $cancelledAt, ['reason' => $reason]);
            }
        } else {
            $this->logAt($canceller, 'collaboration.cancelled', $collab, $cancelledAt, ['reason' => $reason]);
            $otherParty = $canceller->is($umkm) ? $creator : $umkm;
            $this->notify(
                $otherParty,
                CollaborationCancelledNotification::class,
                ['type' => 'collaboration.cancelled', 'collaboration_id' => $collab->id, 'campaign_title' => $entry['campaign']->title, 'cancelled_by_name' => $canceller->name, 'reason' => $reason],
                $cancelledAt,
                $this->faker->boolean(50),
            );
        }

        $this->createConversation($collab, $umkm, $creator, $startedAt, $cancelledAt, $this->faker->numberBetween(3, 8));
        $this->createProgressUpdates($collab, $creator, $startedAt, $cancelledAt, $this->faker->numberBetween(0, 1));

        // Mungkin ada draft submission sebelum batal.
        if ($this->faker->boolean(40)) {
            $submittedAt = $startedAt->copy()->addDays($this->faker->numberBetween(2, 8));
            $status = $this->faker->randomElement([ContentSubmissionStatus::Draft, ContentSubmissionStatus::InReview]);
            $submission = ContentSubmission::factory()->create([
                'collaboration_id' => $collab->id,
                'version' => 1,
                'status' => $status,
                'submitted_at' => $status === ContentSubmissionStatus::Draft ? null : $submittedAt,
                'approved_at' => null,
            ]);
            $this->stamp($submission, $submittedAt ?? $startedAt->copy()->addDay());
        }
    }

    /** @param  array<int, array>  $collabs */
    private function seedReviews(array $collabs): void
    {
        $umkmBodies = [
            'Hasil konten melebihi ekspektasi, komunikasi lancar.',
            'Profesional dan tepat waktu, akan kolaborasi lagi.',
            'Kontennya bagus, sedikit revisi minor tapi cepat diterapkan.',
            'Rating solid, audiensnya antusias dengan brand kami.',
            'Cukup baik, semoga next project lebih variatif deliverable-nya.',
        ];
        $creatorBodies = [
            'Brief jelas, pembayaran tepat waktu, recommended UMKM.',
            'Komunikasi cepat, feedback konstruktif.',
            'Pembayaran lancar, ekspektasi realistis.',
            'Baik, walau ada perubahan brief di tengah jalan.',
        ];

        foreach ($collabs['completed'] as $entry) {
            $collab = $entry['collaboration'];
            if ($collab->completed_at === null) {
                continue;
            }
            $umkm = $entry['umkm'];
            $creator = $entry['creator'];
            $completedAt = Carbon::instance($collab->completed_at);

            $roll = $this->faker->numberBetween(1, 100);
            $umkmToCreator = $roll <= 95;
            $creatorToUmkm = $roll > 5; // ~90% keduanya, ~5% hanya creator→umkm, ~5% hanya umkm→creator

            if ($umkmToCreator) {
                $this->createReview($collab, $umkm, $creator, $completedAt, $umkmBodies);
            }
            if ($creatorToUmkm) {
                $this->createReview($collab, $creator, $umkm, $completedAt, $creatorBodies);
            }
        }
    }

    private function createReview(Collaboration $collab, User $reviewer, User $reviewee, Carbon $at, array $bodies): void
    {
        $rating = $this->weightedRating();
        $review = Review::factory()->create([
            'collaboration_id' => $collab->id,
            'reviewer_id' => $reviewer->id,
            'reviewee_id' => $reviewee->id,
            'rating' => $rating,
            'body' => $this->faker->randomElement($bodies),
            'is_hidden' => $this->faker->boolean(8),
        ]);
        $this->stamp($review, $at->copy()->addDays($this->faker->numberBetween(1, 7)));
    }

    /** @return int<1, 5> */
    private function weightedRating(): int
    {
        $roll = $this->faker->numberBetween(1, 100);

        return match (true) {
            $roll <= 55 => 5,
            $roll <= 82 => 4,
            $roll <= 93 => 3,
            $roll <= 98 => 2,
            default => 1,
        };
    }

    /**
     * @param  array<int, array{user: User, profile: CreatorProfile, verified: bool}>  $creators
     */
    private function recomputeRatings(array $creators): void
    {
        foreach ($creators as $entry) {
            $user = $entry['user'];
            $reviews = Review::query()
                ->where('reviewee_id', $user->id)
                ->where('is_hidden', false);
            $count = (clone $reviews)->count();
            $avg = $count > 0 ? (float) round((float) (clone $reviews)->avg('rating'), 2) : 0.0;
            $entry['profile']->update(['rating_avg' => $avg, 'rating_count' => $count]);
        }
    }

    // ── Building blocks ─────────────────────────────────────────────────

    private function createConversation(Collaboration $collab, User $umkm, User $creator, Carbon $from, Carbon $to, int $messageCount): void
    {
        $conversation = Conversation::factory()->create([
            'collaboration_id' => $collab->id,
            'last_message_at' => $to,
        ]);
        $this->stamp($conversation, $from);

        $span = max(1, $from->diffInDays($to));
        for ($m = 1; $m <= $messageCount; $m++) {
            $msgAt = $from->copy()->addDays((int) round($span * ($m / max(1, $messageCount))));
            if ($msgAt->greaterThan($to)) {
                $msgAt = $to->copy();
            }
            $sender = ($m % 2 === 1) ? $umkm : $creator;
            $message = Message::factory()->create([
                'conversation_id' => $conversation->id,
                'sender_id' => $sender->id,
                'body' => $this->faker->randomElement($this->messagePool($sender->is($creator))),
                'read_at' => $this->faker->boolean(70) ? $msgAt->copy()->addHours($this->faker->numberBetween(1, 24)) : null,
            ]);
            $this->stamp($message, $msgAt);
        }
    }

    /** @return array<int, string> */
    private function messagePool(bool $isCreator): array
    {
        return $isCreator
            ? [
                'Halo, terima kasih sudah accept. Saya mulai persiapan.',
                'Bisa kirim referensi visual & moodboard-nya?',
                'Draft awal sudah saya kerjakan, mohon feedback.',
                'Revisi sesuai catatan sudah diterapkan.',
                'Estimasi final akhir minggu ini.',
                'Oke, understood untuk deliverable tambahan.',
            ]
            : [
                'Halo, selamat bergabung. Ini brief lengkapnya.',
                'Moodboard saya lampirkan, tolong dipelajari.',
                'Draft sudah saya lihat, ada beberapa catatan.',
                'Bagus, lanjutkan ke final cut.',
                'Untuk revisi: perhatikan logo & CTA ya.',
                'Terima kasih, hasilnya memuaskan.',
            ];
    }

    private function createProgressUpdates(Collaboration $collab, User $creator, Carbon $from, Carbon $to, int $count): void
    {
        $span = max(1, $from->diffInDays($to));
        for ($p = 1; $p <= $count; $p++) {
            $updateAt = $from->copy()->addDays((int) round($span * ($p / max(1, $count + 1))));
            if ($updateAt->greaterThan($to)) {
                $updateAt = $to->copy();
            }
            $update = CollaborationProgressUpdate::factory()->create([
                'collaboration_id' => $collab->id,
                'creator_id' => $creator->id,
            ]);
            $this->stamp($update, $updateAt);
        }
    }

    private function addSubmissionFiles(ContentSubmission $submission): void
    {
        $count = $this->faker->numberBetween(1, 3);
        for ($f = 1; $f <= $count; $f++) {
            $file = ContentSubmissionFile::factory()->create(['content_submission_id' => $submission->id]);
            $this->stamp($file, $submission->submitted_at ?? $submission->created_at);
        }
    }

    private function addRevision(ContentSubmission $submission, User $umkm, Carbon $at): void
    {
        $revision = ContentRevision::factory()->create([
            'content_submission_id' => $submission->id,
            'umkm_id' => $umkm->id,
        ]);
        $this->stamp($revision, $at->copy()->addDays($this->faker->numberBetween(1, 4)));
    }

    private function createPaymentProofSubmitted(Collaboration $collab, User $umkm, User $creator, Carbon $at, PaymentStatus $status): CollaborationPayment
    {
        $amount = $collab->campaign->budget ?? $this->faker->numberBetween(500_000, 5_000_000);
        $uuid = $this->faker->uuid();
        $payment = CollaborationPayment::factory()->create([
            'collaboration_id' => $collab->id,
            'amount' => $amount,
            'status' => $status,
            'proof_path' => "payment/{$collab->id}/{$uuid}.jpg",
            'proof_original_name' => 'bukti-transfer.jpg',
            'proof_mime_type' => 'image/jpeg',
            'proof_size' => $this->faker->numberBetween(80_000, 1_500_000),
            'submitted_at' => $at,
        ]);
        $this->stamp($payment, $at);
        $this->logAt($umkm, 'payment.proof_submitted', $payment, $at, ['collaboration_id' => $collab->id, 'amount' => (string) $amount]);
        $this->notify(
            $creator,
            PaymentProofSubmittedNotification::class,
            ['type' => 'payment.proof_submitted', 'collaboration_id' => $collab->id, 'campaign_title' => $collab->campaign?->title, 'amount' => (string) $amount],
            $at,
            $this->faker->boolean(60),
        );

        return $payment;
    }

    private function confirmPayment(Collaboration $collab, User $creator, User $umkm, Carbon $at): void
    {
        $payment = $collab->payment;
        if ($payment === null) {
            return;
        }
        $amount = $payment->amount;
        $payment->forceFill([
            'status' => PaymentStatus::Confirmed,
            'confirmed_at' => $at,
            'confirmed_by' => $creator->id,
        ])->save();
        $this->logAt($creator, 'payment.confirmed', $payment, $at, ['collaboration_id' => $collab->id, 'amount' => (string) $amount]);
        $this->notify(
            $umkm,
            PaymentConfirmedNotification::class,
            ['type' => 'payment.confirmed', 'collaboration_id' => $collab->id, 'campaign_title' => $collab->campaign?->title, 'amount' => (string) $amount],
            $at,
            $this->faker->boolean(60),
        );
    }

    private function voidPayment(Collaboration $collab, User $by, Carbon $at, string $reason): void
    {
        $payment = $collab->payment;
        if ($payment === null) {
            return;
        }
        $amount = $payment->amount;
        $payment->forceFill([
            'status' => PaymentStatus::Voided,
            'voided_at' => $at,
            'voided_by' => $by->id,
            'voided_reason' => $reason,
        ])->save();
        $this->logAt($by, 'payment.voided', $payment, $at, ['collaboration_id' => $collab->id, 'amount' => (string) $amount, 'reason' => $reason]);
        $this->notifyPaymentSettled($collab, $at, $reason, false);
    }

    private function refundPayment(Collaboration $collab, User $admin, Carbon $at, string $reason): void
    {
        $payment = $collab->payment;
        if ($payment === null) {
            return;
        }
        $amount = $payment->amount;
        $payment->forceFill([
            'status' => PaymentStatus::Refunded,
            'voided_at' => $at,
            'voided_by' => $admin->id,
            'voided_reason' => $reason,
        ])->save();
        $this->logAt($admin, 'payment.refunded', $payment, $at, ['collaboration_id' => $collab->id, 'amount' => (string) $amount, 'reason' => $reason]);
        $this->notifyPaymentSettled($collab, $at, $reason, true);
    }

    private function notifyPaymentSettled(Collaboration $collab, Carbon $at, string $reason, bool $isRefund): void
    {
        $umkm = $collab->umkm;
        $creator = $collab->creator;
        $type = $isRefund ? 'payment.refunded' : 'payment.voided';
        $class = $isRefund ? PaymentRefundedNotification::class : PaymentVoidedNotification::class;
        $amount = (string) ($collab->payment?->amount ?? 0);
        $data = [
            'type' => $type,
            'collaboration_id' => $collab->id,
            'campaign_title' => $collab->campaign?->title,
            'amount' => $amount,
            'reason' => $reason,
        ];

        foreach ([$umkm, $creator] as $notifiable) {
            $this->notify($notifiable, $class, $data, $at, $this->faker->boolean(40));
        }
    }

    private function createPayment(Collaboration $collab, PaymentStatus $status, ?Carbon $submittedAt, ?Carbon $confirmedAt, ?User $confirmedBy): CollaborationPayment
    {
        return CollaborationPayment::factory()->create([
            'collaboration_id' => $collab->id,
            'amount' => $collab->campaign->budget ?? $this->faker->numberBetween(500_000, 5_000_000),
            'status' => $status,
            'submitted_at' => $submittedAt,
            'confirmed_at' => $confirmedAt,
            'confirmed_by' => $confirmedBy?->id,
        ]);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private function at(int $minDaysAgo, int $maxDaysAgo): Carbon
    {
        return Carbon::now()->subDays($this->faker->numberBetween($minDaysAgo, $maxDaysAgo));
    }

    private function stamp(Model $m, CarbonInterface $createdAt, ?CarbonInterface $updatedAt = null): Model
    {
        $m->forceFill([
            'created_at' => $createdAt,
            'updated_at' => $updatedAt ?? $createdAt,
        ])->save();

        return $m;
    }

    private function logAt(?User $actor, string $action, ?Model $subject, CarbonInterface $at, array $meta = []): void
    {
        $log = ActivityLog::make([
            'actor_id' => $actor?->id,
            'actor_role' => $actor?->role->value,
            'action' => $action,
            'subject_type' => $subject !== null
                ? Str::of(get_class($subject))->afterLast('\\')->toString().'#'.$subject->getKey()
                : null,
            'subject_id' => $subject?->getKey(),
            'metadata' => $meta ?: null,
        ]);
        $log->created_at = $at;
        $log->save();
    }

    private function notify(User $notifiable, string $typeClass, array $data, Carbon $at, bool $read): void
    {
        $readAt = null;
        if ($read) {
            $readAt = $at->copy()->addHours($this->faker->numberBetween(1, 72));
            if ($readAt->isFuture()) {
                $readAt = Carbon::now();
            }
        }

        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'type' => $typeClass,
            'notifiable_type' => User::class,
            'notifiable_id' => $notifiable->id,
            'data' => json_encode($data, JSON_UNESCAPED_UNICODE),
            'read_at' => $readAt,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }

    /**
     * @param  array<int, array{user: User, profile: CreatorProfile, verified: bool}>  $creators
     * @return array{user: User, profile: CreatorProfile, verified: bool}|null
     */
    private function pickCreatorFor(int $campaignId, array $creators): ?array
    {
        $shuffled = $this->faker->shuffle($creators);
        foreach ($shuffled as $creator) {
            if (! $this->pairUsed($creator['user']->id, $campaignId)) {
                return $creator;
            }
        }

        return null;
    }

    private function pairUsed(int $creatorId, int $campaignId): bool
    {
        return isset($this->usedPairs[$creatorId.'-'.$campaignId]);
    }

    private function markPair(int $creatorId, int $campaignId): void
    {
        $this->usedPairs[$creatorId.'-'.$campaignId] = true;
    }

    /** @param  array<int, int>  $usage */
    private function pickLowUsageIndex(array $usage): int
    {
        $min = min($usage);
        $candidates = array_keys($usage, $min);

        return (int) $this->faker->randomElement($candidates);
    }
}
