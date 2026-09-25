<?php

namespace App\Http\Controllers;

use App\Models\Report5W;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class Report5WController extends Controller
{
    /**
     * Display a listing of the 5W reports.
     */
    public function index(Request $request): Response|JsonResponse
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

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('org_name', 'like', "%{$search}%")
                    ->orWhere('activity_type', 'like', "%{$search}%")
                    ->orWhere('lga', 'like', "%{$search}%")
                    ->orWhere('donor', 'like', "%{$search}%");
            });
        }

        $reports = $query->latest('submitted_at')->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'count' => $reports->count(),
                'reports' => $reports,
            ]);
        }

        return Inertia::render('Wash/ReportsList', [
            'reports' => $reports,
        ]);
    }

    /**
     * Show the form for creating a new 5W report.
     */
    public function create(): Response
    {
        return Inertia::render('Wash/SubmitReport');
    }

    /**
     * Store a single newly created 5W report in storage.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'org_name' => 'required|string|max:255',
            'acronym' => 'nullable|string|max:50',
            'org_type' => 'required|string|max:255',
            'focal_point' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'required|email|max:255',
            'donor' => 'nullable|string|max:255',
            'impl_partners' => 'nullable|string|max:255',
            'domain' => 'nullable|string|max:255',
            'emerg_type' => 'nullable|string|max:255',
            'activity_type' => 'required|string|max:255',
            'indicator' => 'nullable|string|max:255',
            'indicator_desc' => 'nullable|string',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:255',
            'hrp' => 'nullable|string|max:50',
            'qty_planned' => 'nullable|numeric|min:0',
            'qty_achieved' => 'nullable|numeric|min:0',
            'state' => 'required|string|max:255',
            'pcode1' => 'nullable|string|max:50',
            'lga' => 'required|string|max:255',
            'pcode2' => 'nullable|string|max:50',
            'ward' => 'nullable|string|max:255',
            'pcode3' => 'nullable|string|max:50',
            'site_type' => 'nullable|string|max:255',
            'location_name' => 'nullable|string|max:255',
            'location_pop' => 'nullable|string|max:255',
            'settlement' => 'nullable|string|max:255',
            'location_type' => 'nullable|string|max:255',
            'latlong' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'period' => 'required|string|max:255',
            'report_month' => 'nullable|string|max:255',
            'report_date' => 'nullable|string|max:255',
            'status' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'population_group' => 'nullable|string|max:255',
            'benef_type' => 'nullable|string|max:255',
            'pwd' => 'nullable|integer|min:0',
            'men' => 'nullable|integer|min:0',
            'women' => 'nullable|integer|min:0',
            'boys' => 'nullable|integer|min:0',
            'girls' => 'nullable|integer|min:0',
            'comments' => 'nullable|string',
        ]);

        $validated['report_code'] = 'r_'.Str::lower(Str::random(10));
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

        $report = Report5W::create($validated);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Report saved successfully to database.',
                'report' => $report,
            ], 201);
        }

        return redirect()->route('coverage-dashboard')->with('success', 'WASH 5W report submitted successfully.');
    }

    /**
     * Store multiple matrix entries in a single database transaction.
     */
    public function storeBatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'entries' => 'required|array|min:1',
            'entries.*.org_name' => 'required|string|max:255',
            'entries.*.state' => 'required|string|max:255',
            'entries.*.lga' => 'required|string|max:255',
            'entries.*.activity_type' => 'required|string|max:255',
        ]);

        $createdReports = [];

        DB::beginTransaction();
        try {
            foreach ($request->input('entries') as $rawEntry) {
                $men = (int) ($rawEntry['men'] ?? 0);
                $women = (int) ($rawEntry['women'] ?? 0);
                $boys = (int) ($rawEntry['boys'] ?? 0);
                $girls = (int) ($rawEntry['girls'] ?? 0);
                $total = (int) ($rawEntry['total'] ?? ($men + $women + $boys + $girls));

                $report = Report5W::create([
                    'report_code' => 'r_'.Str::lower(Str::random(10)),
                    'user_id' => auth()->id(),
                    'submitted_at' => now(),
                    'submitted_by_role' => auth()->user()?->roles->first()?->name ?? 'partner',
                    'submitted_by_email' => auth()->user()?->email ?? ($rawEntry['email'] ?? 'partner@washsector-ne.org'),
                    'org_name' => $rawEntry['org_name'] ?? $rawEntry['orgName'] ?? 'WASH Partner',
                    'acronym' => $rawEntry['acronym'] ?? null,
                    'org_type' => $rawEntry['org_type'] ?? $rawEntry['orgType'] ?? 'International NGO',
                    'focal_point' => $rawEntry['focal_point'] ?? $rawEntry['focalPoint'] ?? 'Focal Point',
                    'phone' => $rawEntry['phone'] ?? null,
                    'email' => $rawEntry['email'] ?? 'partner@washsector-ne.org',
                    'donor' => $rawEntry['donor'] ?? null,
                    'impl_partners' => $rawEntry['impl_partners'] ?? $rawEntry['implPartners'] ?? null,
                    'domain' => $rawEntry['domain'] ?? null,
                    'emerg_type' => $rawEntry['emerg_type'] ?? $rawEntry['emergType'] ?? null,
                    'activity_type' => $rawEntry['activity_type'] ?? $rawEntry['activityType'] ?? 'Water Supply Provision',
                    'indicator' => $rawEntry['indicator'] ?? null,
                    'indicator_desc' => $rawEntry['indicator_desc'] ?? $rawEntry['indicatorDesc'] ?? ($rawEntry['indicator'] ?? null),
                    'quantity' => (float) ($rawEntry['quantity'] ?? $rawEntry['qty_achieved'] ?? 0),
                    'unit' => $rawEntry['unit'] ?? 'Borehole',
                    'hrp' => $rawEntry['hrp'] ?? 'Yes',
                    'qty_planned' => (float) ($rawEntry['qty_planned'] ?? $rawEntry['qtyPlanned'] ?? 0),
                    'qty_achieved' => (float) ($rawEntry['qty_achieved'] ?? $rawEntry['qtyAchieved'] ?? 0),
                    'state' => $rawEntry['state'] ?? 'Borno',
                    'pcode1' => $rawEntry['pcode1'] ?? null,
                    'lga' => $rawEntry['lga'] ?? 'Maiduguri',
                    'pcode2' => $rawEntry['pcode2'] ?? null,
                    'ward' => $rawEntry['ward'] ?? null,
                    'pcode3' => $rawEntry['pcode3'] ?? null,
                    'site_type' => $rawEntry['site_type'] ?? $rawEntry['siteType'] ?? null,
                    'location_name' => $rawEntry['location_name'] ?? $rawEntry['locationName'] ?? null,
                    'location_pop' => $rawEntry['location_pop'] ?? $rawEntry['locationPop'] ?? null,
                    'settlement' => $rawEntry['settlement'] ?? ($rawEntry['location_name'] ?? null),
                    'location_type' => $rawEntry['location_type'] ?? $rawEntry['locationType'] ?? 'Host Community',
                    'latlong' => $rawEntry['latlong'] ?? null,
                    'latitude' => isset($rawEntry['latitude']) ? (float) $rawEntry['latitude'] : null,
                    'longitude' => isset($rawEntry['longitude']) ? (float) $rawEntry['longitude'] : null,
                    'period' => $rawEntry['period'] ?? $rawEntry['report_month'] ?? '2026-08',
                    'report_month' => $rawEntry['report_month'] ?? $rawEntry['reportMonth'] ?? null,
                    'report_date' => $rawEntry['report_date'] ?? $rawEntry['reportDate'] ?? null,
                    'status' => in_array($rawEntry['status'] ?? '', ['Planned', 'Ongoing', 'Completed', 'Suspended']) ? $rawEntry['status'] : 'Completed',
                    'start_date' => ! empty($rawEntry['start_date']) ? $rawEntry['start_date'] : (! empty($rawEntry['startDate']) ? $rawEntry['startDate'] : null),
                    'end_date' => ! empty($rawEntry['end_date']) ? $rawEntry['end_date'] : (! empty($rawEntry['endDate']) ? $rawEntry['endDate'] : null),
                    'population_group' => $rawEntry['population_group'] ?? $rawEntry['populationGroup'] ?? 'IDPs in Camp',
                    'benef_type' => $rawEntry['benef_type'] ?? $rawEntry['benefType'] ?? null,
                    'pwd' => (int) ($rawEntry['pwd'] ?? 0),
                    'men' => $men,
                    'women' => $women,
                    'boys' => $boys,
                    'girls' => $girls,
                    'total' => $total,
                    'comments' => $rawEntry['comments'] ?? null,
                ]);

                $createdReports[] = $report;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($createdReports).' 5W activity records stored successfully in the database.',
                'reports' => $createdReports,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to save batch reports: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified 5W report from storage.
     */
    public function destroy(Report5W $report, Request $request): JsonResponse|RedirectResponse
    {
        $report->delete();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully from database.',
            ]);
        }

        return redirect()->back()->with('success', 'Report deleted successfully.');
    }
}
