<?php

declare(strict_types=1);

use App\Enums\CollaborationStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Campaign;
use App\Models\Collaboration;
use App\Models\CollaborationPayment;
use App\Models\User;
use App\Notifications\Auth\CollabiteResetPasswordNotification;
use App\Notifications\Auth\CollabiteVerifyEmailNotification;
use App\Notifications\CollaborationCancelledNotification;
use App\Notifications\CollaborationForceClosedNotification;
use App\Notifications\PaymentConfirmedNotification;
use App\Notifications\PaymentProofSubmittedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Notification;

function mailFor(object $notification, User $user): MailMessage
{
    return $notification->toMail($user);
}

test('verify email uses collabite branded template copy', function (): void {
    $user = User::factory()->unverified()->create();

    $mail = mailFor(new CollabiteVerifyEmailNotification, $user);
    $html = (string) $mail->render();

    expect($mail->subject)->toBe('Verifikasi Email Akun Collabite')
        ->and($html)
        ->toContain('Verifikasi Email')
        ->toContain('Salam, Tim Collabite')
        ->toContain('logo.svg')
        ->not->toContain('laravel.com/img/notification-logo');
});

test('reset password uses collabite branded template copy', function (): void {
    $user = User::factory()->create();

    $mail = mailFor(new CollabiteResetPasswordNotification('test-token'), $user);
    $html = (string) $mail->render();

    expect($mail->subject)->toBe('Reset Password Collabite')
        ->and($html)
        ->toContain('Reset Password')
        ->toContain('Salam, Tim Collabite')
        ->toContain('logo.svg');
});

test('payment notifications include database and mail channels and are queued', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create();
    $umkm = User::factory()->withRole(UserRole::Umkm)->create();
    $campaign = Campaign::factory()->create(['title' => 'Campaign Demo']);
    $collaboration = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkm->id,
        'creator_id' => $creator->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);
    $payment = CollaborationPayment::create([
        'collaboration_id' => $collaboration->id,
        'amount' => '1500000.00',
        'status' => PaymentStatus::AwaitingConfirmation,
    ]);

    $proofSubmitted = new PaymentProofSubmittedNotification($payment);
    $confirmed = new PaymentConfirmedNotification($payment);

    expect($proofSubmitted)->toBeInstanceOf(ShouldQueue::class)
        ->and($proofSubmitted->via($creator))->toBe(['database', 'mail']);

    $proofMail = mailFor($proofSubmitted, $creator);
    $proofHtml = (string) $proofMail->render();
    expect($proofMail->subject)->toBe('Bukti pembayaran diunggah')
        ->and($proofHtml)
        ->toContain('Campaign Demo')
        ->toContain('Lihat Kolaborasi')
        ->toContain('logo.svg');

    expect($confirmed)->toBeInstanceOf(ShouldQueue::class)
        ->and($confirmed->via($umkm))->toBe(['database', 'mail']);

    $confirmedMail = mailFor($confirmed, $umkm);
    $confirmedHtml = (string) $confirmedMail->render();
    expect($confirmedMail->subject)->toBe('Pembayaran dikonfirmasi')
        ->and($confirmedHtml)
        ->toContain('Campaign Demo');
});

test('collaboration cancelled notification sends branded mail', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create();
    $umkm = User::factory()->withRole(UserRole::Umkm)->create();
    $campaign = Campaign::factory()->create(['title' => 'Kolaborasi Uji']);
    $collaboration = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkm->id,
        'creator_id' => $creator->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);

    $notification = new CollaborationCancelledNotification(
        $collaboration,
        $umkm,
        'Brief tidak sesuai',
    );

    expect($notification)->toBeInstanceOf(ShouldQueue::class)
        ->and($notification->via($creator))->toBe(['database', 'mail']);

    $mail = mailFor($notification, $creator);
    $html = (string) $mail->render();

    expect($mail->subject)->toBe('Kolaborasi dibatalkan')
        ->and($html)
        ->toContain('Kolaborasi Uji')
        ->toContain('Brief tidak sesuai');
});

test('force close notification sends branded mail to both parties', function (): void {
    $creator = User::factory()->withRole(UserRole::Creator)->create();
    $umkm = User::factory()->withRole(UserRole::Umkm)->create();
    $campaign = Campaign::factory()->create(['title' => 'Kolaborasi Uji']);
    $collaboration = Collaboration::create([
        'campaign_id' => $campaign->id,
        'umkm_id' => $umkm->id,
        'creator_id' => $creator->id,
        'status' => CollaborationStatus::Active,
        'started_at' => now(),
    ]);

    $notification = new CollaborationForceClosedNotification($collaboration, 'Pelanggaran kebijakan');

    expect($notification)->toBeInstanceOf(ShouldQueue::class)
        ->and($notification->via($creator))->toBe(['database', 'mail']);

    $mail = mailFor($notification, $creator);
    $html = (string) $mail->render();

    expect($mail->subject)->toBe('Kolaborasi ditutup paksa')
        ->and($html)
        ->toContain('Kolaborasi Uji')
        ->toContain('Pelanggaran kebijakan')
        ->toContain('Lihat Kolaborasi');
});

test('user model sends collabite auth notifications', function (): void {
    Notification::fake();

    $user = User::factory()->unverified()->create();
    $user->sendEmailVerificationNotification();

    Notification::assertSentTo($user, CollabiteVerifyEmailNotification::class);

    $user->sendPasswordResetNotification('token-123');

    Notification::assertSentTo($user, CollabiteResetPasswordNotification::class);
});
