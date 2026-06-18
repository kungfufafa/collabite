<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ModerationController as AdminModerationController;
use App\Http\Controllers\Admin\ReportsController as AdminReportsController;
use App\Http\Controllers\Admin\UsersController as AdminUsersController;
use App\Http\Controllers\Admin\VerificationsController as AdminVerificationsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Creator\CampaignsController as CreatorCampaignsController;
use App\Http\Controllers\Creator\CollaborationsController as CreatorCollaborationsController;
use App\Http\Controllers\Creator\DashboardController as CreatorDashboardController;
use App\Http\Controllers\Creator\PortfolioController as CreatorPortfolioController;
use App\Http\Controllers\Creator\ProfileController as CreatorProfileController;
use App\Http\Controllers\Creator\SkillsController as CreatorSkillsController;
use App\Http\Controllers\Creator\VerificationController as CreatorVerificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FilesController;
use App\Http\Controllers\Public\CreatorDirectoryController as PublicCreatorDirectoryController;
use App\Http\Controllers\Public\ProfileController as PublicProfileController;
use App\Http\Controllers\Umkm\CampaignsController as UmkmCampaignsController;
use App\Http\Controllers\Umkm\CollaborationsController as UmkmCollaborationsController;
use App\Http\Controllers\Umkm\DashboardController as UmkmDashboardController;
use App\Http\Controllers\Umkm\DiscoverController as UmkmDiscoverController;
use App\Http\Controllers\Umkm\ProductsController as UmkmProductsController;
use App\Http\Controllers\Umkm\ProfileController as UmkmProfileController;
use App\Http\Controllers\Umkm\ReviewsController as UmkmReviewsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => inertia('Public/Welcome'))->name('home');
Route::get('creators', [PublicCreatorDirectoryController::class, 'index'])->name('public.creators.index');
Route::get('creators/{creatorProfile}', [PublicCreatorDirectoryController::class, 'show'])->name('public.creators.show');

/*
|--------------------------------------------------------------------------
| Guest (auth)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register/umkm', [RegisteredUserController::class, 'storeUmkm'])->name('register.umkm.store');
    Route::post('register/creator', [RegisteredUserController::class, 'storeCreator'])->name('register.creator.store');

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('reset-password', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'active'])->group(function (): void {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::get('verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed'])
        ->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::middleware(['verified', 'role:umkm'])
        ->prefix('umkm')
        ->name('umkm.')
        ->group(function (): void {
            Route::get('dashboard', [UmkmDashboardController::class, 'index'])->name('dashboard');

            Route::get('profile', [UmkmProfileController::class, 'edit'])->name('profile.edit');
            Route::patch('profile', [UmkmProfileController::class, 'update'])->name('profile.update');

            Route::get('products', [UmkmProductsController::class, 'index'])->name('products.index');
            Route::post('products', [UmkmProductsController::class, 'store'])->name('products.store');
            Route::patch('products/{product}', [UmkmProductsController::class, 'update'])->name('products.update');
            Route::delete('products/{product}', [UmkmProductsController::class, 'destroy'])->name('products.destroy');

            Route::get('campaigns', [UmkmCampaignsController::class, 'index'])->name('campaigns.index');
            Route::get('campaigns/create', [UmkmCampaignsController::class, 'create'])->name('campaigns.create');
            Route::post('campaigns', [UmkmCampaignsController::class, 'store'])->name('campaigns.store');
            Route::get('campaigns/{campaign}', [UmkmCampaignsController::class, 'show'])->name('campaigns.show');
            Route::get('campaigns/{campaign}/edit', [UmkmCampaignsController::class, 'edit'])->name('campaigns.edit');
            Route::patch('campaigns/{campaign}', [UmkmCampaignsController::class, 'update'])->name('campaigns.update');
            Route::post('campaigns/{campaign}/publish', [UmkmCampaignsController::class, 'publish'])->name('campaigns.publish');
            Route::post('campaigns/{campaign}/cancel', [UmkmCampaignsController::class, 'cancel'])->name('campaigns.cancel');

            Route::get('discover', [UmkmDiscoverController::class, 'index'])->name('discover.index');

            Route::get('collaborations', [UmkmCollaborationsController::class, 'index'])->name('collaborations.index');
            Route::get('collaborations/{collaboration}', [UmkmCollaborationsController::class, 'show'])->name('collaborations.show');
            Route::post('collaborations/{collaboration}/messages', [UmkmCollaborationsController::class, 'sendMessage'])->name('collaborations.messages.store');
            Route::post('collaborations/{collaboration}/requests/{request}/accept', [UmkmCollaborationsController::class, 'acceptRequest'])->name('collaborations.requests.accept');
            Route::post('collaborations/{collaboration}/requests/{request}/reject', [UmkmCollaborationsController::class, 'rejectRequest'])->name('collaborations.requests.reject');
            Route::post('collaborations/{collaboration}/submit-for-review/{submission}', [UmkmCollaborationsController::class, 'submitForReview'])->name('collaborations.submissions.submitForReview');
            Route::post('collaborations/{collaboration}/submissions/{submission}/request-revision', [UmkmCollaborationsController::class, 'requestRevision'])->name('collaborations.submissions.requestRevision');
            Route::post('collaborations/{collaboration}/submissions/{submission}/approve', [UmkmCollaborationsController::class, 'approveSubmission'])->name('collaborations.submissions.approve');
            Route::post('collaborations/{collaboration}/submissions', [UmkmCollaborationsController::class, 'storeSubmission'])->name('collaborations.submissions.store');
            Route::post('collaborations/{collaboration}/progress', [UmkmCollaborationsController::class, 'storeProgress'])->name('collaborations.progress.store');
            Route::post('collaborations/{collaboration}/complete', [UmkmCollaborationsController::class, 'complete'])->name('collaborations.complete');
            Route::post('collaborations/{collaboration}/review', [UmkmReviewsController::class, 'storeForUmkm'])->name('collaborations.review.store');
            Route::post('collaborations/{collaboration}/invitations', [UmkmCollaborationsController::class, 'invite'])->name('collaborations.invitations.store');
        });

    Route::middleware(['verified', 'role:creator'])
        ->prefix('creator')
        ->name('creator.')
        ->group(function (): void {
            Route::get('dashboard', [CreatorDashboardController::class, 'index'])->name('dashboard');

            Route::get('profile', [CreatorProfileController::class, 'edit'])->name('profile.edit');
            Route::patch('profile', [CreatorProfileController::class, 'update'])->name('profile.update');

            Route::get('portfolio', [CreatorPortfolioController::class, 'index'])->name('portfolio.index');
            Route::post('portfolio', [CreatorPortfolioController::class, 'store'])->name('portfolio.store');
            Route::delete('portfolio/{portfolioItem}', [CreatorPortfolioController::class, 'destroy'])->name('portfolio.destroy');

            Route::get('skills', [CreatorSkillsController::class, 'edit'])->name('skills.edit');
            Route::patch('skills', [CreatorSkillsController::class, 'update'])->name('skills.update');

            Route::get('verification', [CreatorVerificationController::class, 'show'])->name('verification.show');
            Route::post('verification', [CreatorVerificationController::class, 'submit'])->name('verification.submit');

            Route::get('campaigns', [CreatorCampaignsController::class, 'index'])->name('campaigns.index');
            Route::get('campaigns/{campaign}', [CreatorCampaignsController::class, 'show'])->name('campaigns.show');
            Route::post('campaigns/{campaign}/apply', [CreatorCampaignsController::class, 'apply'])->name('campaigns.apply');

            Route::get('collaborations', [CreatorCollaborationsController::class, 'index'])->name('collaborations.index');
            Route::get('collaborations/{collaboration}', [CreatorCollaborationsController::class, 'show'])->name('collaborations.show');
            Route::post('collaborations/{collaboration}/messages', [CreatorCollaborationsController::class, 'sendMessage'])->name('collaborations.messages.store');
            Route::post('collaborations/{collaboration}/submissions', [CreatorCollaborationsController::class, 'storeSubmission'])->name('collaborations.submissions.store');
            Route::post('collaborations/{collaboration}/submissions/{submission}/submit-for-review', [CreatorCollaborationsController::class, 'submitForReview'])->name('collaborations.submissions.submitForReview');
            Route::post('collaborations/{collaboration}/progress', [CreatorCollaborationsController::class, 'storeProgress'])->name('collaborations.progress.store');
            Route::post('collaborations/{collaboration}/requests/{request}/accept', [CreatorCollaborationsController::class, 'acceptRequest'])->name('collaborations.requests.accept');
            Route::post('collaborations/{collaboration}/requests/{request}/reject', [CreatorCollaborationsController::class, 'rejectRequest'])->name('collaborations.requests.reject');
            Route::post('collaborations/{collaboration}/requests/{request}/cancel', [CreatorCollaborationsController::class, 'cancelRequest'])->name('collaborations.requests.cancel');
            Route::post('collaborations/{collaboration}/review', [CreatorCollaborationsController::class, 'submitReview'])->name('collaborations.review.store');
        });

    Route::middleware(['verified', 'role:admin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function (): void {
            Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

            Route::get('users', [AdminUsersController::class, 'index'])->name('users.index');
            Route::patch('users/{user}/status', [AdminUsersController::class, 'updateStatus'])->name('users.status.update');

            Route::get('verifications', [AdminVerificationsController::class, 'index'])->name('verifications.index');
            Route::get('verifications/{verification}', [AdminVerificationsController::class, 'show'])->name('verifications.show');
            Route::post('verifications/{verification}/approve', [AdminVerificationsController::class, 'approve'])->name('verifications.approve');
            Route::post('verifications/{verification}/reject', [AdminVerificationsController::class, 'reject'])->name('verifications.reject');

            Route::get('moderation/campaigns', [AdminModerationController::class, 'campaigns'])->name('moderation.campaigns');
            Route::patch('moderation/campaigns/{campaign}/hide', [AdminModerationController::class, 'toggleCampaignHide'])->name('moderation.campaigns.hide');

            Route::get('moderation/content', [AdminModerationController::class, 'content'])->name('moderation.content');
            Route::patch('moderation/content/{submission}/hide', [AdminModerationController::class, 'toggleSubmissionHide'])->name('moderation.content.hide');

            Route::get('moderation/reviews', [AdminModerationController::class, 'reviews'])->name('moderation.reviews');
            Route::patch('moderation/reviews/{review}/hide', [AdminModerationController::class, 'toggleReviewHide'])->name('moderation.reviews.hide');

            Route::get('audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');

            Route::get('reports', [AdminReportsController::class, 'index'])->name('reports.index');
            Route::get('reports/export', [AdminReportsController::class, 'export'])->name('reports.export');
        });
});

/*
|--------------------------------------------------------------------------
| Private files via signed URL
|--------------------------------------------------------------------------
*/
Route::get('files/private/{path}', [FilesController::class, 'show'])
    ->where('path', '.*')
    ->middleware('signed')
    ->name('files.private');

/*
|--------------------------------------------------------------------------
| Public UMKM profile (registered last to avoid conflict with /umkm prefix)
|--------------------------------------------------------------------------
*/
Route::get('umkm/{umkmProfile}', [PublicProfileController::class, 'showUmkm'])
    ->whereNumber('umkmProfile')
    ->name('public.umkm.show');
