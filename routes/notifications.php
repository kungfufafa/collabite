<?php

declare(strict_types=1);

use App\Http\Controllers\NotificationsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'active'])->group(function (): void {
    Route::get('notifications', [NotificationsController::class, 'index'])->name('notifications.index');
    Route::get('notifications/{notification}', [NotificationsController::class, 'show'])->name('notifications.show');
    Route::post('notifications/read-all', [NotificationsController::class, 'markAllRead'])->name('notifications.read-all');
});
