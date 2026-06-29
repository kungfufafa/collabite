<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\CampaignStatus;
use App\Enums\CollaborationRequestStatus;
use App\Enums\CollaborationRequestType;
use App\Enums\CollaborationStatus;
use App\Enums\ContentSubmissionStatus;
use App\Enums\UserRole;
use App\Enums\VerificationDocumentType;
use App\Enums\VerificationStatus;
use App\Models\Campaign;
use App\Models\CampaignDeliverable;
use App\Models\Category;
use App\Models\Collaboration;
use App\Models\CollaborationProgressUpdate;
use App\Models\CollaborationRequest;
use App\Models\ContentSubmission;
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
use App\Services\AuditLogger;
use Illuminate\Database\Seeder;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeder data demo untuk RC walkthrough.
 *
 * Idempotent dan hanya berjalan di environment `local`/`testing`.
 * Lihat docs/DEMO_ACCOUNTS.md untuk akun & skenario yang dihasilkan.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Demo data is safe for local + any testing.* environment.
        // Production must never be seeded with demo accounts.
        $env = app()->environment();

        if ($env !== 'local' && ! str_starts_with($env, 'testing')) {
            return;
        }

        $audit = app(AuditLogger::class);

        // ── Categories & skills (pastikan tersedia untuk attach) ──────────
        $categorySlugByName = [
            'Food & Beverage' => Category::where('slug', 'food-beverage')->first(),
            'Tech & Gadget' => Category::where('slug', 'tech-gadget')->first(),
        ];

        $skillSlugs = ['photography', 'video-editing', 'social-media', 'copywriting', 'influencer-marketing'];
        $skills = Skill::whereIn('slug', $skillSlugs)->get()->keyBy('slug');

        // ── Admin (re-ensure, idempotent) ──────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'admin@collabite.test'],
            [
                'name' => 'Admin Collabite',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'account_status' => AccountStatus::Active,
                'email_verified_at' => now(),
            ],
        );

        // ── UMKM ────────────────────────────────────────────────────────────
        $umkmUsers = [
            ['email' => 'umkm1@collabite.test', 'name' => 'Sari (Kedai Kopi Sari)', 'business' => 'Kedai Kopi Sari'],
            ['email' => 'umkm2@collabite.test', 'name' => 'Andi (Batik Nusantara)', 'business' => 'Batik Nusantara'],
            ['email' => 'umkm3@collabite.test', 'name' => 'Rina (Kecantikan Alami)', 'business' => 'Kecantikan Alami'],
        ];

        $umkmProfiles = [];
        foreach ($umkmUsers as $row) {
            $user = User::updateOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'password' => Hash::make('password'),
                    'role' => UserRole::Umkm,
                    'account_status' => AccountStatus::Active,
                    'email_verified_at' => now(),
                ],
            );

            $profile = UmkmProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => $row['business'],
                    'business_type' => 'Mikro',
                    'description' => $row['business'].' — UMKM demo Collabite.',
                    'address' => 'Jl. Demo No. 1',
                    'city' => 'Bandung',
                    'contact_phone' => '+622200000001',
                    'contact_email' => $row['email'],
                    'website_url' => 'https://demo.test',
                ],
            );

            $umkmProfiles[$row['email']] = ['user' => $user, 'profile' => $profile];
        }

        // Produk hanya untuk UMKM1 (biar skenario walkthrough fokus).
        $umkm1 = $umkmProfiles['umkm1@collabite.test'];
        Product::updateOrCreate(
            ['umkm_profile_id' => $umkm1['profile']->id, 'name' => 'Kopi Arabica 250g'],
            [
                'description' => 'Biji kopi single-origin Bandung.',
                'price' => 75000,
                'is_active' => true,
            ],
        );
        Product::updateOrCreate(
            ['umkm_profile_id' => $umkm1['profile']->id, 'name' => 'Kopi Susu Botol 250ml'],
            [
                'description' => 'Minuman kopi susu siap minum.',
                'price' => 18000,
                'is_active' => true,
            ],
        );

        // ── Creators ────────────────────────────────────────────────────────
        $creator1 = User::updateOrCreate(
            ['email' => 'creator1@collabite.test'],
            [
                'name' => 'Citra Kreatif',
                'password' => Hash::make('password'),
                'role' => UserRole::Creator,
                'account_status' => AccountStatus::Active,
                'email_verified_at' => now(),
            ],
        );

        $creator1Profile = CreatorProfile::updateOrCreate(
            ['user_id' => $creator1->id],
            [
                'headline' => 'Content Creator F&B & Lifestyle',
                'bio' => 'Spesialis short-form video dan storytelling untuk brand F&B lokal.',
                'city' => 'Bandung',
                'contact_phone' => '+6281100000001',
                'contact_email' => 'creator1@collabite.test',
                'verification_status' => VerificationStatus::Verified,
                'rating_avg' => 0,
                'rating_count' => 0,
            ],
        );
        // Attach 2 kategori & 3 skill.
        if ($categorySlugByName['Food & Beverage']) {
            $creator1Profile->categories()->syncWithoutDetaching([$categorySlugByName['Food & Beverage']->id]);
            $categorySlugByName['Tech & Gadget']
                && $creator1Profile->categories()->syncWithoutDetaching([$categorySlugByName['Tech & Gadget']->id]);
        }
        foreach (['photography', 'video-editing', 'social-media'] as $slug) {
            if ($skills->has($slug)) {
                $creator1Profile->skills()->syncWithoutDetaching([$skills[$slug]->id]);
            }
        }
        // 2 portfolio items.
        PortfolioItem::updateOrCreate(
            ['creator_profile_id' => $creator1Profile->id, 'title' => 'Behind the Scene Kopi Sari'],
            [
                'description' => 'Mini documentary proses sangrai kopi.',
                'external_url' => 'https://demo.test/portfolio/1',
                'display_order' => 1,
            ],
        );
        PortfolioItem::updateOrCreate(
            ['creator_profile_id' => $creator1Profile->id, 'title' => 'Review Gadget Harian'],
            [
                'description' => 'Series review gadget untuk audiens muda.',
                'external_url' => 'https://demo.test/portfolio/2',
                'display_order' => 2,
            ],
        );
        $audit->log($admin, 'demo.creator.verified', $creator1Profile);

        // creator2 — pending verification.
        $creator2 = User::updateOrCreate(
            ['email' => 'creator2@collabite.test'],
            [
                'name' => 'Dimas Pratama',
                'password' => Hash::make('password'),
                'role' => UserRole::Creator,
                'account_status' => AccountStatus::Active,
                'email_verified_at' => now(),
            ],
        );
        $creator2Profile = CreatorProfile::updateOrCreate(
            ['user_id' => $creator2->id],
            [
                'headline' => 'Videographer Pemula',
                'bio' => 'Lulusan broadcasting, fokus konten cinematic.',
                'city' => 'Jakarta',
                'verification_status' => VerificationStatus::Pending,
                'rating_avg' => 0,
                'rating_count' => 0,
            ],
        );
        $creator2Verification = CreatorVerification::updateOrCreate(
            ['creator_profile_id' => $creator2Profile->id, 'status' => VerificationStatus::Pending],
            [
                'submitted_at' => now()->subDay(),
                'reviewed_at' => null,
                'reviewed_by' => null,
                'rejection_reason' => null,
            ],
        );
        // Dummy document metadata pointing at a non-existent file path
        // (intentionally fake — tidak ada upload beneran).
        CreatorVerificationDocument::updateOrCreate(
            [
                'creator_verification_id' => $creator2Verification->id,
                'original_name' => 'ktp-dimas.pdf',
            ],
            [
                'type' => VerificationDocumentType::IdentityCard,
                'file_path' => 'demo/sample.pdf',
                'mime_type' => 'application/pdf',
                'size' => 102400,
            ],
        );
        $audit->log($creator2, 'demo.verification.submitted', $creator2Verification);

        // creator3 — rejected.
        $creator3 = User::updateOrCreate(
            ['email' => 'creator3@collabite.test'],
            [
                'name' => 'Rudi Hartono',
                'password' => Hash::make('password'),
                'role' => UserRole::Creator,
                'account_status' => AccountStatus::Active,
                'email_verified_at' => now(),
            ],
        );
        $creator3Profile = CreatorProfile::updateOrCreate(
            ['user_id' => $creator3->id],
            [
                'headline' => 'Foto & Videografi',
                'verification_status' => VerificationStatus::Rejected,
                'rating_avg' => 0,
                'rating_count' => 0,
            ],
        );
        CreatorVerification::updateOrCreate(
            ['creator_profile_id' => $creator3Profile->id, 'status' => VerificationStatus::Rejected],
            [
                'submitted_at' => now()->subDays(3),
                'reviewed_at' => now()->subDays(2),
                'reviewed_by' => $admin->id,
                'rejection_reason' => 'Foto KTP tidak jelas',
            ],
        );
        $audit->log($admin, 'demo.verification.rejected', $creator3Profile);

        // ── Campaigns ───────────────────────────────────────────────────────
        $foodCategory = $categorySlugByName['Food & Beverage'];

        $campaignA = Campaign::updateOrCreate(
            ['umkm_profile_id' => $umkm1['profile']->id, 'title' => 'Promo Kopi Baru'],
            [
                'category_id' => $foodCategory?->id,
                'description' => 'Shooting 3 video pendek + 5 foto produk untuk peluncuran varian baru.',
                'budget' => 2500000,
                'deadline' => now()->addWeeks(3),
                'status' => CampaignStatus::Open,
                'is_hidden' => false,
                'published_at' => now()->subDays(2),
            ],
        );
        // deliverables
        CampaignDeliverable::updateOrCreate(
            ['campaign_id' => $campaignA->id, 'title' => 'Video Reels 30 detik'],
            ['description' => 'Format vertikal 1080x1920', 'quantity' => 1],
        );
        CampaignDeliverable::updateOrCreate(
            ['campaign_id' => $campaignA->id, 'title' => 'Foto Produk High-res'],
            ['description' => 'Minimal 5 foto produk', 'quantity' => 5],
        );

        $campaignB = Campaign::updateOrCreate(
            ['umkm_profile_id' => $umkm1['profile']->id, 'title' => 'Story Kopi Pagi'],
            [
                'category_id' => $foodCategory?->id,
                'description' => 'Storytelling pagi hari, 1 video 60 detik.',
                'budget' => 1200000,
                'deadline' => now()->addWeeks(2),
                'status' => CampaignStatus::Open,
                'is_hidden' => false,
                'published_at' => now()->subDay(),
            ],
        );

        $campaignC = Campaign::updateOrCreate(
            ['umkm_profile_id' => $umkmProfiles['umkm2@collabite.test']['profile']->id, 'title' => 'Showcase Koleksi Batik'],
            [
                'category_id' => $foodCategory?->id,
                'description' => 'Lookbook motion 15 detik untuk koleksi batik modern.',
                'budget' => 1800000,
                'deadline' => now()->addWeeks(4),
                'status' => CampaignStatus::InCollaboration,
                'is_hidden' => false,
                'published_at' => now()->subWeeks(2),
            ],
        );

        $campaignD = Campaign::updateOrCreate(
            ['umkm_profile_id' => $umkmProfiles['umkm3@collabite.test']['profile']->id, 'title' => 'Launching Skincare Lokal'],
            [
                'category_id' => $foodCategory?->id,
                'description' => 'Kampanye 1 minggu, 3 posting + 1 video.',
                'budget' => 3000000,
                'deadline' => now()->subWeek(),
                'status' => CampaignStatus::Completed,
                'is_hidden' => false,
                'published_at' => now()->subWeeks(4),
            ],
        );

        // ── Collaboration requests ──────────────────────────────────────────
        // Application: creator1 → campaignA (Promo Kopi Baru)
        CollaborationRequest::updateOrCreate(
            [
                'campaign_id' => $campaignA->id,
                'creator_id' => $creator1->id,
                'type' => CollaborationRequestType::Application,
            ],
            [
                'sender_id' => $creator1->id,
                'status' => CollaborationRequestStatus::Pending,
                'message' => 'Saya tertarik dengan campaign Promo Kopi Baru.',
            ],
        );
        $audit->log($creator1, 'demo.collaboration_request.applied', $campaignA);

        // Invitation: UMKM1 → creator2 for campaignB (Story Kopi Pagi)
        CollaborationRequest::updateOrCreate(
            [
                'campaign_id' => $campaignB->id,
                'creator_id' => $creator2->id,
                'type' => CollaborationRequestType::Invitation,
            ],
            [
                'sender_id' => $umkm1['user']->id,
                'status' => CollaborationRequestStatus::Pending,
                'message' => 'Kami mengundang Anda untuk campaign Story Kopi Pagi.',
            ],
        );
        $audit->log($umkm1['user'], 'demo.collaboration_request.invited', $campaignB);

        // Notification untuk invitation.
        DatabaseNotification::create([
            'id' => (string) Str::uuid(),
            'type' => 'App\\Notifications\\CollaborationRequestReceived',
            'notifiable_type' => User::class,
            'notifiable_id' => $creator2->id,
            'data' => [
                'campaign_id' => $campaignB->id,
                'campaign_title' => $campaignB->title,
                'message' => 'Anda menerima undangan kolaborasi baru.',
            ],
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── Active collaboration (UMKM2 + creator1) ────────────────────────
        $umkm2 = $umkmProfiles['umkm2@collabite.test'];
        $activeCollab = Collaboration::updateOrCreate(
            ['campaign_id' => $campaignC->id, 'creator_id' => $creator1->id],
            [
                'umkm_id' => $umkm2['user']->id,
                'status' => CollaborationStatus::Active,
                'started_at' => now()->subWeek(),
                'completed_at' => null,
                'cancelled_at' => null,
                'cancelled_by' => null,
                'cancelled_reason' => null,
            ],
        );

        $activeConversation = Conversation::updateOrCreate(
            ['collaboration_id' => $activeCollab->id],
            ['last_message_at' => now()->subHour()],
        );
        Message::updateOrCreate(
            ['conversation_id' => $activeConversation->id, 'body' => 'Halo, kami siap mulai produksi.'],
            ['sender_id' => $umkm2['user']->id, 'created_at' => now()->subDays(6), 'updated_at' => now()->subDays(6)],
        );
        Message::updateOrCreate(
            ['conversation_id' => $activeConversation->id, 'body' => 'Terima kasih, saya akan mulai syuting minggu ini.'],
            ['sender_id' => $creator1->id, 'created_at' => now()->subDays(5), 'updated_at' => now()->subDays(5)],
        );

        CollaborationProgressUpdate::updateOrCreate(
            [
                'collaboration_id' => $activeCollab->id,
                'message' => 'Shooting day 1 selesai, 3 looks terekam.',
            ],
            [
                'creator_id' => $creator1->id,
                'attachment_path' => null,
                'attachment_original_name' => null,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
        );

        ContentSubmission::updateOrCreate(
            ['collaboration_id' => $activeCollab->id, 'version' => 1],
            [
                'title' => 'Draft 1 — Showcase Batik',
                'description' => 'Draft pertama untuk direview.',
                'status' => ContentSubmissionStatus::InReview,
                'is_hidden' => false,
                'submitted_at' => now()->subDay(),
                'approved_at' => null,
            ],
        );
        $audit->log($creator1, 'demo.collaboration.started', $activeCollab);

        // ── Completed collaboration (UMKM3 + creator1) ─────────────────────
        $umkm3 = $umkmProfiles['umkm3@collabite.test'];
        $completedCollab = Collaboration::updateOrCreate(
            ['campaign_id' => $campaignD->id, 'creator_id' => $creator1->id],
            [
                'umkm_id' => $umkm3['user']->id,
                'status' => CollaborationStatus::Completed,
                'started_at' => now()->subWeeks(3),
                'completed_at' => now()->subDays(3),
            ],
        );

        ContentSubmission::updateOrCreate(
            ['collaboration_id' => $completedCollab->id, 'version' => 1],
            [
                'title' => 'Final Cut — Skincare Launch',
                'description' => 'Final video kampanye.',
                'status' => ContentSubmissionStatus::Approved,
                'is_hidden' => false,
                'submitted_at' => now()->subWeeks(2),
                'approved_at' => now()->subDays(4),
            ],
        );

        Review::updateOrCreate(
            ['collaboration_id' => $completedCollab->id, 'reviewer_id' => $umkm3['user']->id],
            [
                'reviewee_id' => $creator1->id,
                'rating' => 5,
                'body' => 'Hasil komunikasi & konten sangat memuaskan.',
                'is_hidden' => false,
            ],
        );
        Review::updateOrCreate(
            ['collaboration_id' => $completedCollab->id, 'reviewer_id' => $creator1->id],
            [
                'reviewee_id' => $umkm3['user']->id,
                'rating' => 4,
                'body' => 'Brief jelas, pembayaran tepat waktu.',
                'is_hidden' => false,
            ],
        );

        // Bump rating creator1 (avg=5, count=1).
        $creator1Profile->forceFill([
            'rating_avg' => 5.0,
            'rating_count' => 1,
        ])->save();
        $audit->log($umkm3['user'], 'demo.collaboration.completed', $completedCollab);

        // ── Notifications for completion + invitation parties ──────────────
        DatabaseNotification::create([
            'id' => (string) Str::uuid(),
            'type' => 'App\\Notifications\\CollaborationCompleted',
            'notifiable_type' => User::class,
            'notifiable_id' => $creator1->id,
            'data' => [
                'campaign_id' => $campaignD->id,
                'campaign_title' => $campaignD->title,
                'message' => 'Kolaborasi telah selesai. Silakan berikan review.',
            ],
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DatabaseNotification::create([
            'id' => (string) Str::uuid(),
            'type' => 'App\\Notifications\\CampaignApplied',
            'notifiable_type' => User::class,
            'notifiable_id' => $umkm1['user']->id,
            'data' => [
                'campaign_id' => $campaignA->id,
                'campaign_title' => $campaignA->title,
                'creator_id' => $creator1->id,
                'creator_name' => $creator1->name,
                'message' => 'Citra Kreatif melamar di campaign Anda.',
            ],
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
