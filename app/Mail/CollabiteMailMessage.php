<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Notifications\Messages\MailMessage;

class CollabiteMailMessage
{
    public static function make(): MailMessage
    {
        return (new MailMessage)
            ->salutation('Salam, Tim Collabite');
    }
}
