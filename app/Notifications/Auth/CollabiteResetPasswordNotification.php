<?php

declare(strict_types=1);

namespace App\Notifications\Auth;

use App\Mail\CollabiteMailMessage;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CollabiteResetPasswordNotification extends ResetPassword implements ShouldQueue
{
    use Queueable;

    protected function buildMailMessage($url): MailMessage
    {
        $expireMinutes = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

        return CollabiteMailMessage::make()
            ->subject('Reset Password Collabite')
            ->greeting('Halo!')
            ->line('Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.')
            ->action('Reset Password', $url)
            ->line('Tautan reset password berlaku selama '.$expireMinutes.' menit.')
            ->line('Jika Anda tidak meminta reset password, abaikan email ini.');
    }
}
