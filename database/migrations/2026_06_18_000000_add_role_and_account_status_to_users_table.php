<?php

declare(strict_types=1);

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add role and account_status columns to users table.
     * See PRD §11.1 (FR-AUTH-007, FR-AUTH-008) and TDD §8/§9.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 16)
                ->default(UserRole::Umkm->value)
                ->after('email');
            $table->string('account_status', 16)
                ->default(AccountStatus::Active->value)
                ->after('role');

            $table->index('role');
            $table->index('account_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['role']);
            $table->dropIndex(['account_status']);
            $table->dropColumn(['role', 'account_status']);
        });
    }
};
