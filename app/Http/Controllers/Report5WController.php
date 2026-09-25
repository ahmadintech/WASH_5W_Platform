<?php

namespace App\Http\Controllers;

use App\Models\Report5W;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class Report5WController extends Controller
{
    public function index(Request $request): Response
    {
        $reports = Report5W::latest()->get();

        return Inertia::render('Wash/ReportsList', [
            'reports' => $reports,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Wash/SubmitReport');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'org_name' => 'required|string|max:255',
            'org_type' => 'required|string|max:255',
            'focal_point' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'donor' => 'nullable|string|max:255',
            'activity_type' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:255',
            'indicator_desc' => 'nullable|string',
            'state' => 'required|string|max:255',
            'lga' => 'required|string|max:255',
            'ward' => 'nullable|string|max:255',
            'settlement' => 'nullable|string|max:255',
            'location_type' => 'nullable|string|max:255',
            'period' => 'required|string|max:255',
            'status' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'population_group' => 'nullable|string|max:255',
            'pwd' => 'nullable|integer|min:0',
            'men' => 'nullable|integer|min:0',
            'women' => 'nullable|integer|min:0',
            'boys' => 'nullable|integer|min:0',
            'girls' => 'nullable|integer|min:0',
        ]);

        $validated['report_code'] = 'r_'.Str::random(8);
        $validated['submitted_at'] = now();
        $validated['submitted_by_role'] = auth()->user()?->roles->first()?->name ?? 'partner';
        $validated['submitted_by_email'] = auth()->user()?->email ?? $validated['email'];
        $validated['user_id'] = auth()->id();

        $pwd = $validated['pwd'] ?? 0;
        $men = $validated['men'] ?? 0;
        $women = $validated['women'] ?? 0;
        $boys = $validated['boys'] ?? 0;
        $girls = $validated['girls'] ?? 0;
        $validated['total'] = $men + $women + $boys + $girls;

        Report5W::create($validated);

        return redirect()->route('coverage-dashboard')->with('success', 'WASH 5W report submitted successfully.');
    }

    public function destroy(Report5W $report): RedirectResponse
    {
        $report->delete();

        return redirect()->back()->with('success', 'Report deleted successfully.');
    }
}
