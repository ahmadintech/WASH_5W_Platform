<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Role-based dashboard page
        if ($user->hasRole('admin')) {
            return Inertia::render('Admin/Dashboard', [
                'stats' => $this->getStats(),
            ]);
        }

        if ($user->hasRole('coordinator')) {
            return Inertia::render('Dashboard/CoordinatorDashboard', [
                'stats' => $this->getStats(),
            ]);
        }

        // Partner default
        return Inertia::render('Dashboard/WashHome', [
            'stats' => $this->getPartnerStats($user),
        ]);
    }

    private function getStats(): array
    {
        return [
            'totalReports' => 0, // Phase 6: \App\Models\Report5W::count()
            'totalBeneficiaries' => 0,
            'totalPartners' => 0,
            'totalLgas' => 0,
            'pendingReview' => 0,
        ];
    }

    private function getPartnerStats($user): array
    {
        return [
            'totalReports' => 0,
            'totalBeneficiaries' => 0,
            'totalPartners' => 0,
            'totalLgas' => 0,
        ];
    }
}
