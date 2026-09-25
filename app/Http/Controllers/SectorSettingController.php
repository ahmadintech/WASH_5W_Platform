<?php

namespace App\Http\Controllers;

use App\Models\SectorSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectorSettingController extends Controller
{
    /**
     * Get all active sector settings.
     */
    public function index(): JsonResponse
    {
        $settings = SectorSetting::allKeyed();

        // Provide defaults if not yet in DB
        $reportingConfig = $settings['reporting_config'] ?? [
            'activeCycle' => '2026-08',
            'deadlineDate' => '2026-09-12',
            'isFreezeActive' => false,
            'notes' => 'Monthly 5W submission window for BAY states response.',
        ];

        $systemConfig = $settings['system_config'] ?? [
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
        ];

        return response()->json([
            'success' => true,
            'settings' => $settings,
            'reportingConfig' => $reportingConfig,
            'systemConfig' => $systemConfig,
            'activityCategories' => $settings['activity_categories'] ?? null,
            'units' => $settings['units'] ?? null,
            'locationTypes' => $settings['location_types'] ?? null,
            'populationGroups' => $settings['population_groups'] ?? null,
            'states' => $settings['states'] ?? null,
            'lgasByState' => $settings['lgas_by_state'] ?? null,
            'wardsByLga' => $settings['wards_by_lga'] ?? null,
        ]);
    }

    /**
     * Update sector settings key-value pair or multiple configs.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'nullable|string',
            'value' => 'nullable',
            'group' => 'nullable|string',
            'settings' => 'nullable|array',
            'reportingConfig' => 'nullable|array',
            'systemConfig' => 'nullable|array',
        ]);

        if ($request->has('reportingConfig')) {
            SectorSetting::set('reporting_config', $request->input('reportingConfig'), 'cycles', 'Active reporting cycle and deadline cutoff');
        }

        if ($request->has('systemConfig')) {
            SectorSetting::set('system_config', $request->input('systemConfig'), 'system', 'Global platform parameters');
        }

        if ($request->has('activityCategories')) {
            SectorSetting::set('activity_categories', $request->input('activityCategories'), 'programs', 'WASH activity categories');
        }

        if ($request->has('units')) {
            SectorSetting::set('units', $request->input('units'), 'programs', 'Reporting measurement units');
        }

        if ($request->has('locationTypes')) {
            SectorSetting::set('location_types', $request->input('locationTypes'), 'locations', 'Settlement and location types');
        }

        if ($request->has('populationGroups')) {
            SectorSetting::set('population_groups', $request->input('populationGroups'), 'programs', 'Target population groups');
        }

        if ($request->has('states')) {
            SectorSetting::set('states', $request->input('states'), 'locations', 'Covered states');
        }

        if ($request->has('lgasByState')) {
            SectorSetting::set('lgas_by_state', $request->input('lgasByState'), 'locations', 'LGAs mapped by state');
        }

        if ($request->has('wardsByLga')) {
            SectorSetting::set('wards_by_lga', $request->input('wards_by_lga') ?? $request->input('wardsByLga'), 'locations', 'Wards mapped by LGA');
        }

        if ($request->has('key')) {
            SectorSetting::set(
                $request->input('key'),
                $request->input('value'),
                $request->input('group', 'general')
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Sector settings updated successfully in database.',
            'settings' => SectorSetting::allKeyed(),
        ]);
    }
}
