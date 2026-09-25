<?php

use App\Http\Controllers\CoverageDashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\Report5WController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| WASH 5W Platform Web Routes (Strict Inertia SPA Integration)
|--------------------------------------------------------------------------
*/

// 1. Root & Public Landing Page (Served live via LandingController)
Route::get('/', LandingController::class)->name('home');
Route::get('/landing', LandingController::class)->name('landing');
Route::get('/home', LandingController::class);

// 2. WASH Public Dashboards & Form Submissions
Route::get('/dashboard', CoverageDashboardController::class)->name('dashboard');
Route::get('/coverage-dashboard', CoverageDashboardController::class)->name('coverage-dashboard');
Route::get('/submit-report', [Report5WController::class, 'create'])->name('submit-report');
Route::post('/submit-report', [Report5WController::class, 'store'])->name('submit-report.store');
Route::get('/reports-list', [Report5WController::class, 'index'])->name('reports-list');
Route::delete('/reports/{report}', [Report5WController::class, 'destroy'])->name('reports.destroy');
Route::get('/partners', [PartnerController::class, 'index'])->name('partners');

// 3. Authenticated Admin & Coordinator Workspace
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn () => Inertia::render('Dashboard/Home'))->name('index');
    Route::get('/dashboard', fn () => Inertia::render('Dashboard/Home'))->name('dashboard');
    Route::get('/settings', fn () => Inertia::render('Admin/SectorSettings'))->name('settings');
    Route::get('/users', fn () => Inertia::render('Admin/UserManagement'))->name('users');
    Route::get('/powerbi', fn () => Inertia::render('Admin/PowerBiExport'))->name('powerbi');
});

// Coordinator Workspace
Route::get('/coordinator/dashboard', fn () => Inertia::render('Dashboard/CoordinatorDashboard'))->name('coordinator.dashboard');
Route::get('/powerbi', fn () => Inertia::render('Admin/PowerBiExport'))->name('powerbi');

// 4. Authentication Pages
Route::get('/signin', fn () => Inertia::render('AuthPages/SignIn'))->name('signin');
Route::get('/signup', fn () => Inertia::render('AuthPages/SignUp'))->name('signup');

// 5. User Profile & System Utility Pages
Route::get('/profile', fn () => Inertia::render('UserProfiles'))->name('profile');
Route::get('/calendar', fn () => Inertia::render('Calendar'))->name('calendar');
Route::get('/form-elements', fn () => Inertia::render('Forms/FormElements'))->name('form-elements');
Route::get('/basic-tables', fn () => Inertia::render('Tables/BasicTables'))->name('basic-tables');
Route::get('/blank', fn () => Inertia::render('Blank'))->name('blank');

// 6. Charts & UI Elements
Route::prefix('charts')->name('charts.')->group(function () {
    Route::get('/bar-chart', fn () => Inertia::render('Charts/BarChart'))->name('bar-chart');
    Route::get('/line-chart', fn () => Inertia::render('Charts/LineChart'))->name('line-chart');
});

Route::prefix('ui-elements')->name('ui-elements.')->group(function () {
    Route::get('/alerts', fn () => Inertia::render('UiElements/Alerts'))->name('alerts');
    Route::get('/avatars', fn () => Inertia::render('UiElements/Avatars'))->name('avatars');
    Route::get('/badges', fn () => Inertia::render('UiElements/Badges'))->name('badges');
    Route::get('/buttons', fn () => Inertia::render('UiElements/Buttons'))->name('buttons');
    Route::get('/images', fn () => Inertia::render('UiElements/Images'))->name('images');
    Route::get('/videos', fn () => Inertia::render('UiElements/Videos'))->name('videos');
});

// 7. Legacy /TailAdmin Base Path Support
Route::prefix('TailAdmin')->group(function () {
    Route::get('/', fn () => Inertia::render('Dashboard/Home'));
    Route::get('/landing', LandingController::class);
    Route::get('/home', LandingController::class);
    Route::get('/dashboard', CoverageDashboardController::class);
    Route::get('/reports-list', [Report5WController::class, 'index']);
    Route::get('/profile', fn () => Inertia::render('UserProfiles'));
    Route::get('/signin', fn () => Inertia::render('AuthPages/SignIn'));
    Route::get('/signup', fn () => Inertia::render('AuthPages/SignUp'));
});

// 8. Fallback 404
Route::fallback(fn () => Inertia::render('OtherPage/NotFound'));
