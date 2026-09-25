<?php

namespace App\Http\Middleware;

use App\Models\ResourceDocument;
use App\Models\SectorSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * These are available on every Inertia page via usePage().props
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id' => 'usr_'.$user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'role' => $user->hasRole('admin') ? 'admin' : ($user->hasRole('coordinator') ? 'coordinator' : ($user->roles->first()?->name ?? 'partner')),
                    'roleTitle' => $user->role_title ?? ($user->hasRole('admin') ? 'Sector Administrator' : ($user->hasRole('coordinator') ? 'State Coordinator' : 'Implementing Partner')),
                    'organization' => $user->organization ?? 'WASH Sector North East Nigeria',
                    'organizationType' => $user->organization_type ?? 'Government / UN Co-Lead',
                    'state' => $user->state ?? 'Borno',
                    'lga' => $user->lga ?? 'Maiduguri',
                    'avatar' => $user->avatar ?? 'https://api.dicebear.com/9.x/avataaars/svg?seed='.urlencode($user->name),
                    'organisation_id' => $user->organisation_id ?? null,
                ] : null,
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
                'roles' => $user ? $user->getRoleNames() : [],
            ],

            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],

            'sectorSettings' => fn () => [
                'reportingConfig' => SectorSetting::get('reporting_config', [
                    'activeCycle' => '2026-08',
                    'deadlineDate' => '2026-09-12',
                    'isFreezeActive' => false,
                    'notes' => 'Monthly 5W submission window for BAY states humanitarian response.',
                ]),
                'systemConfig' => SectorSetting::get('system_config', [
                    'platformTitle' => 'WASH 5W Activity Reporting Platform',
                    'leadAgency' => 'UNICEF / Federal Ministry of Water Resources',
                    'operationalContext' => 'North East Nigeria (BAY States Humanitarian Response)',
                    'defaultState' => 'Borno',
                    'requireGps' => true,
                    'requirePwd' => true,
                    'autoSaveDrafts' => true,
                    'draftIntervalSeconds' => 30,
                    'enableDeadlineReminders' => true,
                    'reminderDaysBefore' => 3,
                    'choleraAlertThreshold' => 5,
                    'replyToEmail' => 'washcluster.nigeria@unicef.org',
                    'enableHdxSync' => false,
                    'hdxApiKey' => '',
                    'enablePublicDashboard' => true,
                    'dataRetentionDays' => 365,
                ]),
                'all' => SectorSetting::allKeyed(),
            ],

            'resources' => fn () => ResourceDocument::where('is_published', true)
                ->orderBy('sort_order', 'asc')
                ->latest()
                ->get(),
        ];
    }
}
