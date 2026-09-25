<?php

namespace Database\Seeders;

use App\Models\Partner;
use App\Models\Report5W;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class WASH5WSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Roles exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $coordinatorRole = Role::firstOrCreate(['name' => 'coordinator']);
        $partnerRole = Role::firstOrCreate(['name' => 'partner']);

        // 2. Create Default System Accounts
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@washsector-ne.org'],
            [
                'name' => 'State WASH Administrator',
                'password' => Hash::make('password123'),
            ]
        );
        $adminUser->assignRole($adminRole);

        $coordinatorUser = User::firstOrCreate(
            ['email' => 'coordinator@washsector-ne.org'],
            [
                'name' => 'Borno State WASH Coordinator',
                'password' => Hash::make('password123'),
            ]
        );
        $coordinatorUser->assignRole($coordinatorRole);

        $partnerUser = User::firstOrCreate(
            ['email' => 'partner@solidarites.org'],
            [
                'name' => 'Solidarités International Focal Point',
                'password' => Hash::make('password123'),
            ]
        );
        $partnerUser->assignRole($partnerRole);

        // 3. Seed Partners
        $partnersData = [
            [
                'name' => 'Action Against Hunger (ACF)',
                'acronym' => 'ACF',
                'org_type' => 'International NGO',
                'focal_point_name' => 'Tariq Mansoor',
                'focal_point_email' => 'tmansoor@ng-actionagainsthunger.org',
                'focal_point_phone' => '+2348030000001',
                'donor' => 'FCDO / BHA',
                'states_covered' => ['Borno', 'Yobe'],
                'is_active' => true,
            ],
            [
                'name' => 'International Rescue Committee (IRC)',
                'acronym' => 'IRC',
                'org_type' => 'International NGO',
                'focal_point_name' => 'Bello Mohammed',
                'focal_point_email' => 'bello.mohammed@rescue.org',
                'focal_point_phone' => '+2348030000002',
                'donor' => 'USAID / BHA',
                'states_covered' => ['Borno', 'Adamawa', 'Yobe'],
                'is_active' => true,
            ],
            [
                'name' => 'Norwegian Refugee Council (NRC)',
                'acronym' => 'NRC',
                'org_type' => 'International NGO',
                'focal_point_name' => 'Amina Yusuf',
                'focal_point_email' => 'amina.yusuf@nrc.no',
                'focal_point_phone' => '+2348030000003',
                'donor' => 'NMFA / ECHO',
                'states_covered' => ['Borno'],
                'is_active' => true,
            ],
            [
                'name' => 'Solidarités International',
                'acronym' => 'SI',
                'org_type' => 'International NGO',
                'focal_point_name' => 'Ibrahim Mustapha',
                'focal_point_email' => 'imustapha@solidarites-nigeria.org',
                'focal_point_phone' => '+2348030000004',
                'donor' => 'BHA / NHF',
                'states_covered' => ['Borno'],
                'is_active' => true,
            ],
            [
                'name' => 'UNICEF Nigeria',
                'acronym' => 'UNICEF',
                'org_type' => 'UN Agency',
                'focal_point_name' => 'UNICEF WASH Team',
                'focal_point_email' => 'washcluster.nigeria@unicef.org',
                'focal_point_phone' => '+23480092744357',
                'donor' => 'Global WASH Cluster',
                'states_covered' => ['Borno', 'Adamawa', 'Yobe'],
                'is_active' => true,
            ],
        ];

        foreach ($partnersData as $data) {
            Partner::firstOrCreate(['name' => $data['name']], $data);
        }

        $siPartner = Partner::where('acronym', 'SI')->first();

        // 4. Seed 5W Reports
        $reports = [
            [
                'report_code' => 'r_1001',
                'submitted_at' => now()->subDays(2),
                'submitted_by_role' => 'partner',
                'submitted_by_email' => 'partner@solidarites.org',
                'partner_id' => $siPartner?->id,
                'org_name' => 'Solidarités International',
                'org_type' => 'International NGO',
                'focal_point' => 'Ibrahim Mustapha',
                'email' => 'imustapha@solidarites-nigeria.org',
                'donor' => 'BHA / USAID',
                'activity_type' => 'Water point construction / rehabilitation',
                'quantity' => 12.00,
                'unit' => 'Boreholes',
                'indicator_desc' => 'Solar-powered motorized borehole construction with water tap stands in IDP camps.',
                'state' => 'Borno',
                'lga' => 'Maiduguri',
                'ward' => 'Bolori II',
                'settlement' => 'Bakassi IDP Camp',
                'location_type' => 'IDP camp / camp-like setting',
                'period' => '2026-08',
                'status' => 'Completed',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-25',
                'population_group' => 'IDPs in camps',
                'pwd' => 72,
                'men' => 1420,
                'women' => 1680,
                'boys' => 1150,
                'girls' => 1350,
                'total' => 5600,
            ],
            [
                'report_code' => 'r_1002',
                'submitted_at' => now()->subDays(4),
                'submitted_by_role' => 'partner',
                'submitted_by_email' => 'partner@solidarites.org',
                'partner_id' => $siPartner?->id,
                'org_name' => 'Solidarités International',
                'org_type' => 'International NGO',
                'focal_point' => 'Ibrahim Mustapha',
                'email' => 'imustapha@solidarites-nigeria.org',
                'donor' => 'NHF (Nigeria Humanitarian Fund)',
                'activity_type' => 'Hygiene kit distribution',
                'quantity' => 850.00,
                'unit' => 'Kits',
                'indicator_desc' => 'Distribution of standard WASH hygiene kits including Jerrycans, Aquatabs, Soap, and Menstrual Hygiene items.',
                'state' => 'Borno',
                'lga' => 'Jere',
                'ward' => 'Mashamari',
                'settlement' => 'Muna Garage IDP Site',
                'location_type' => 'IDP camp / camp-like setting',
                'period' => '2026-08',
                'status' => 'Completed',
                'start_date' => '2026-08-05',
                'end_date' => '2026-08-20',
                'population_group' => 'IDPs in camps',
                'pwd' => 95,
                'men' => 950,
                'women' => 1400,
                'boys' => 880,
                'girls' => 1020,
                'total' => 4250,
            ],
            [
                'report_code' => 'r_1003',
                'submitted_at' => now()->subDays(6),
                'submitted_by_role' => 'partner',
                'submitted_by_email' => 'tmansoor@ng-actionagainsthunger.org',
                'org_name' => 'Action Against Hunger (ACF)',
                'org_type' => 'International NGO',
                'focal_point' => 'Tariq Mansoor',
                'email' => 'tmansoor@ng-actionagainsthunger.org',
                'donor' => 'FCDO',
                'activity_type' => 'Household latrine construction',
                'quantity' => 85.00,
                'unit' => 'Latrine stances',
                'indicator_desc' => 'Gender-segregated emergency semi-permanent latrines with handwashing stations.',
                'state' => 'Borno',
                'lga' => 'Monguno',
                'ward' => 'Monguno Central',
                'settlement' => 'Stadium Camp',
                'location_type' => 'IDP camp / camp-like setting',
                'period' => '2026-08',
                'status' => 'Ongoing',
                'start_date' => '2026-08-10',
                'end_date' => '2026-09-15',
                'population_group' => 'IDPs in camps',
                'pwd' => 64,
                'men' => 920,
                'women' => 1140,
                'boys' => 810,
                'girls' => 980,
                'total' => 3850,
            ],
            [
                'report_code' => 'r_1004',
                'submitted_at' => now()->subDays(8),
                'submitted_by_role' => 'partner',
                'submitted_by_email' => 'amina.yusuf@nrc.no',
                'org_name' => 'Norwegian Refugee Council (NRC)',
                'org_type' => 'International NGO',
                'focal_point' => 'Amina Yusuf',
                'email' => 'amina.yusuf@nrc.no',
                'donor' => 'NMFA',
                'activity_type' => 'Water trucking',
                'quantity' => 450000.00,
                'unit' => 'Litres per day',
                'indicator_desc' => 'Emergency water provision (15 litres/person/day) to newly arrived displaced households.',
                'state' => 'Borno',
                'lga' => 'Gwoza',
                'ward' => 'Gwoza Wakane',
                'settlement' => 'Transit Site A',
                'location_type' => 'Informal settlement',
                'period' => '2026-08',
                'status' => 'Completed',
                'start_date' => '2026-08-01',
                'end_date' => '2026-08-31',
                'population_group' => 'IDPs outside camps',
                'pwd' => 180,
                'men' => 3100,
                'women' => 3600,
                'boys' => 2900,
                'girls' => 3200,
                'total' => 12800,
            ],
            [
                'report_code' => 'r_1005',
                'submitted_at' => now()->subDays(10),
                'submitted_by_role' => 'partner',
                'submitted_by_email' => 'bello.mohammed@rescue.org',
                'org_name' => 'International Rescue Committee (IRC)',
                'org_type' => 'International NGO',
                'focal_point' => 'Bello Mohammed',
                'email' => 'bello.mohammed@rescue.org',
                'donor' => 'USAID / BHA',
                'activity_type' => 'Desludging services',
                'quantity' => 42.00,
                'unit' => 'Latrine stances',
                'indicator_desc' => 'Safe mechanical desludging and waste transport to sector-approved disposal site.',
                'state' => 'Yobe',
                'lga' => 'Damaturu',
                'ward' => 'Kukasare',
                'settlement' => 'Kasuwar Shanu Settlement',
                'location_type' => 'Host community',
                'period' => '2026-08',
                'status' => 'Completed',
                'start_date' => '2026-08-08',
                'end_date' => '2026-08-22',
                'population_group' => 'Host community',
                'pwd' => 32,
                'men' => 680,
                'women' => 790,
                'boys' => 590,
                'girls' => 640,
                'total' => 2700,
            ],
        ];

        foreach ($reports as $rep) {
            Report5W::firstOrCreate(['report_code' => $rep['report_code']], $rep);
        }
    }
}
