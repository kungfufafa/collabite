<?php

declare(strict_types=1);

namespace App\Notifications\Auth;

use App\Mail\CollabiteMailMessage;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class CollabiteVerifyEmailNotification extends VerifyEmail
{
    protected function buildMailMessage($url): MailMessage
    {
        return CollabiteMailMessage::make()
            ->subject('Verifikasi Email Akun Collabite')
            ->greeting('Halo!')
            ->line('Silakan klik tombol di bawah untuk memverifikasi alamat email Anda.')
            ->action('Verifikasi Email', $url)
            ->line('Jika Anda tidak membuat akun Collabite, abaikan email ini.');
    }
}
