<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\Public\LandingPageDataService;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __invoke(LandingPageDataService $landing): Response
    {
        return Inertia::render('Public/Welcome', [
            'featuredCreators' => $landing->featuredCreators(),
            'heroSpotlight' => $landing->heroSpotlight(),
            'featuredCampaign' => $landing->featuredCampaign(),
            'categories' => $landing->categories(),
        ]);
    }
}
