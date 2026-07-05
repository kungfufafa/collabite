<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function privacy(): Response
    {
        return Inertia::render('Public/PrivacyPolicy');
    }

    public function terms(): Response
    {
        return Inertia::render('Public/TermsOfService');
    }
}
