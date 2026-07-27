<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ganti unique plain (creator_id, campaign_id) dan (campaign_id) yang tidak
 * sadar status dengan unique bertipe generated column `active_key`.
 *
 * - collaboration_requests.active_key = 0 saat status pending/accepted,
 *   selain itu NULL. Unique (creator_id, campaign_id, active_key) memastikan
 *   hanya satu request aktif per creator+campaign; baris terminal bernilai
 *   NULL dan MySQL mengizinkan banyak NULL pada unique, sehingga creator
 *   dapat melamar ulang / UMKM mengundang ulang setelah status terminal.
 *
 * - collaborations.active_key = 0 saat status active, selain itu NULL.
 *   Unique (campaign_id, active_key) memastikan satu kolaborasi aktif per
 *   campaign namun memperbolehkan kolaborasi baru setelah yang lama
 *   dibatalkan (campaign reopen).
 *
 * Catatan: MySQL melarang generated column mereferensi kolom auto-increment,
 * jadi kita pakai NULL (bukan id) sebagai nilai untuk baris terminal.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collaboration_requests', function (Blueprint $table): void {
            // Indeks FK independen sebelum unique lama (yang juga jadi indeks
            // creator_id) di-drop, karena MySQL butuh indeks pada kolom FK.
            if (! Schema::hasIndex('collaboration_requests', 'collab_requests_creator_id_index')) {
                $table->index('creator_id', 'collab_requests_creator_id_index');
            }
            if (Schema::hasIndex('collaboration_requests', 'unique_active_request_per_creator_campaign')) {
                $table->dropUnique('unique_active_request_per_creator_campaign');
            }
        });

        Schema::table('collaboration_requests', function (Blueprint $table): void {
            if (! Schema::hasColumn('collaboration_requests', 'active_key')) {
                $table->unsignedTinyInteger('active_key')
                    ->nullable()
                    ->storedAs("CASE WHEN `status` IN ('pending', 'accepted') THEN 0 ELSE NULL END")
                    ->after('status');
            }
            if (! Schema::hasIndex('collaboration_requests', 'unique_active_request_per_creator_campaign')) {
                $table->unique(['creator_id', 'campaign_id', 'active_key'], 'unique_active_request_per_creator_campaign');
            }
        });

        Schema::table('collaborations', function (Blueprint $table): void {
            if (! Schema::hasIndex('collaborations', 'collaborations_campaign_id_index')) {
                $table->index('campaign_id', 'collaborations_campaign_id_index');
            }
            if (Schema::hasIndex('collaborations', 'collaborations_campaign_id_unique')) {
                $table->dropUnique('collaborations_campaign_id_unique');
            }
        });

        Schema::table('collaborations', function (Blueprint $table): void {
            if (! Schema::hasColumn('collaborations', 'active_key')) {
                $table->unsignedTinyInteger('active_key')
                    ->nullable()
                    ->storedAs("CASE WHEN `status` = 'active' THEN 0 ELSE NULL END")
                    ->after('status');
            }
            if (! Schema::hasIndex('collaborations', 'collaborations_campaign_id_unique')) {
                $table->unique(['campaign_id', 'active_key'], 'collaborations_campaign_id_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('collaborations', function (Blueprint $table): void {
            $table->dropUnique('collaborations_campaign_id_unique');
            $table->dropColumn('active_key');
            $table->unique('campaign_id', 'collaborations_campaign_id_unique');
            $table->dropIndex('collaborations_campaign_id_index');
        });

        Schema::table('collaboration_requests', function (Blueprint $table): void {
            $table->dropUnique('unique_active_request_per_creator_campaign');
            $table->dropColumn('active_key');
            $table->unique(['creator_id', 'campaign_id'], 'unique_active_request_per_creator_campaign');
            $table->dropIndex('collab_requests_creator_id_index');
        });
    }
};
