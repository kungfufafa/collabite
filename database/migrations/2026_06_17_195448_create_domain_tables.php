<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Domain migrations untuk Collabite MVP. Skema mengikuti TDD §13.
 */
return new class extends Migration
{
    public function up(): void
    {
        // --- Profile (UMKM) ---
        Schema::create('umkm_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->string('business_type', 80);
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('city', 80)->nullable();
            $table->string('logo_path')->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('contact_email')->nullable();
            $table->string('website_url')->nullable();
            $table->timestamps();

            $table->index('city');
            $table->index('business_type');
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('umkm_profile_id')->constrained('umkm_profiles')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['umkm_profile_id', 'is_active']);
        });

        // --- Categories / Skills ---
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // --- Profile (Creator) ---
        Schema::create('creator_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_photo_path')->nullable();
            $table->string('city', 80)->nullable();
            $table->string('contact_phone', 30)->nullable();
            $table->string('contact_email')->nullable();
            $table->string('verification_status', 32)->default('unverified');
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->timestamps();

            $table->index('city');
            $table->index('verification_status');
            $table->index('rating_avg');
        });

        Schema::create('creator_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('creator_profile_id')->constrained('creator_profiles')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['creator_profile_id', 'category_id']);
        });

        Schema::create('creator_skills', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('creator_profile_id')->constrained('creator_profiles')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['creator_profile_id', 'skill_id']);
        });

        Schema::create('portfolio_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('creator_profile_id')->constrained('creator_profiles')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('media_path')->nullable();
            $table->string('external_url')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['creator_profile_id', 'display_order']);
        });

        // --- Verification ---
        Schema::create('creator_verifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('creator_profile_id')->constrained('creator_profiles')->cascadeOnDelete();
            $table->string('status', 32)->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['status', 'creator_profile_id']);
        });

        Schema::create('creator_verification_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('creator_verification_id')->constrained('creator_verifications')->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size');
            $table->timestamps();

            $table->index('creator_verification_id');
        });

        // --- Campaign ---
        Schema::create('campaigns', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('umkm_profile_id')->constrained('umkm_profiles')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories');
            $table->string('title');
            $table->text('description');
            $table->decimal('budget', 14, 2)->nullable();
            $table->date('deadline')->nullable();
            $table->string('status', 32)->default('draft');
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_hidden']);
            $table->index('category_id');
            $table->index('umkm_profile_id');
            $table->index('deadline');
        });

        Schema::create('campaign_deliverables', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('campaign_id')->constrained('campaigns')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->index('campaign_id');
        });

        // --- Collaboration requests & collaborations ---
        Schema::create('collaboration_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('campaign_id')->constrained('campaigns')->cascadeOnDelete();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('status', 32)->default('pending');
            $table->text('message')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['creator_id', 'campaign_id'], 'unique_active_request_per_creator_campaign');
            $table->index('status');
            $table->index('campaign_id');
        });

        Schema::create('collaborations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('campaign_id')->unique()->constrained('campaigns')->cascadeOnDelete();
            $table->foreignId('umkm_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 32)->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('cancelled_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('umkm_id');
            $table->index('creator_id');
            $table->index('status');
        });

        Schema::create('collaboration_progress_updates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('collaboration_id')->constrained('collaborations')->cascadeOnDelete();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->string('attachment_path')->nullable();
            $table->string('attachment_original_name')->nullable();
            $table->timestamps();

            $table->index(['collaboration_id', 'created_at']);
        });

        Schema::create('conversations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('collaboration_id')->unique()->constrained('collaborations')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['conversation_id', 'created_at']);
        });

        Schema::create('message_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size');
            $table->timestamps();

            $table->index('message_id');
        });

        Schema::create('content_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('collaboration_id')->constrained('collaborations')->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status', 32)->default('draft');
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['collaboration_id', 'version']);
            $table->index(['collaboration_id', 'status']);
            $table->index('is_hidden');
        });

        Schema::create('content_submission_files', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('content_submission_id')->constrained('content_submissions')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size');
            $table->timestamps();

            $table->index('content_submission_id');
        });

        Schema::create('content_revisions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('content_submission_id')->constrained('content_submissions')->cascadeOnDelete();
            $table->foreignId('umkm_id')->constrained('users')->cascadeOnDelete();
            $table->text('note');
            $table->timestamps();

            $table->index('content_submission_id');
        });

        Schema::create('reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('collaboration_id')->constrained('collaborations')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewee_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('body')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['collaboration_id', 'reviewer_id']);
            $table->index(['reviewee_id', 'is_hidden']);
        });

        Schema::create('activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_role', 32)->nullable();
            $table->string('action');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('action');
            $table->index(['subject_type', 'subject_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('content_revisions');
        Schema::dropIfExists('content_submission_files');
        Schema::dropIfExists('content_submissions');
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('collaboration_progress_updates');
        Schema::dropIfExists('collaborations');
        Schema::dropIfExists('collaboration_requests');
        Schema::dropIfExists('campaign_deliverables');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('creator_verification_documents');
        Schema::dropIfExists('creator_verifications');
        Schema::dropIfExists('portfolio_items');
        Schema::dropIfExists('creator_skills');
        Schema::dropIfExists('creator_categories');
        Schema::dropIfExists('creator_profiles');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('products');
        Schema::dropIfExists('umkm_profiles');
    }
};
