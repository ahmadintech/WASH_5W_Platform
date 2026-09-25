<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\Report5W;
use App\Models\ResourceDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $reports = Report5W::latest()->get();
        $partners = Partner::where('is_active', true)->get();

        $totalBeneficiaries = $reports->sum('total');
        $reportsSubmitted = $reports->count();
        $activePartners = $partners->count();
        $lgasCovered = $reports->pluck('lga')->unique()->filter()->count();

        $resources = ResourceDocument::where('is_published', true)
            ->orderBy('sort_order', 'asc')
            ->latest()
            ->get();

        return Inertia::render('Landing/LandingPage', [
            'stats' => [
                'totalBeneficiaries' => $totalBeneficiaries,
                'reportsSubmitted' => $reportsSubmitted,
                'activePartners' => $activePartners,
                'lgasCovered' => $lgasCovered,
            ],
            'recentReports' => $reports->take(5),
            'partners' => $partners,
            'resources' => $resources,
        ]);
    }
}
