<?php

namespace App\Http\Controllers;

use App\Models\Report5W;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoverageDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $query = Report5W::query();

        if ($state = $request->input('state')) {
            $query->where('state', $state);
        }

        if ($lga = $request->input('lga')) {
            $query->where('lga', $lga);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $reports = $query->latest('submitted_at')->get();

        return Inertia::render('Wash/CoverageDashboard', [
            'initialReports' => $reports,
            'filters' => $request->only(['state', 'lga', 'status']),
            'summary' => [
                'totalBeneficiaries' => $reports->sum('total'),
                'totalReports' => $reports->count(),
                'ongoingProjects' => $reports->where('status', 'Ongoing')->count(),
                'completedProjects' => $reports->where('status', 'Completed')->count(),
            ],
        ]);
    }
}
