<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Policies otomatis didaftarkan via Laravel convention.
        Gate::before(function ($user, $ability): ?bool {
            return null;
        });
    }
}
