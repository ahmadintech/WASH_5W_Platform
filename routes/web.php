<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CoverageDashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\Report5WController;
use App\Models\Report5W;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| WASH 5W Platform Web & API Routes (Strict Inertia SPA Integration)
|--------------------------------------------------------------------------
*/

// 1. Root & Public Landing Page
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

use App\Http\Controllers\ResourceDocumentController;
use App\Http\Controllers\SectorSettingController;

// 3. API Endpoints (5W Data persistence, Settings, Resources & Auth)
Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('api.login');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
    Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
    Route::get('/user', [AuthController::class, 'me'])->name('api.user');

    Route::get('/reports', [Report5WController::class, 'index'])->name('api.reports.index');
    Route::post('/reports', [Report5WController::class, 'store'])->name('api.reports.store');
    Route::post('/reports/batch', [Report5WController::class, 'storeBatch'])->name('api.reports.batch');
    Route::delete('/reports/{report}', [Report5WController::class, 'destroy'])->name('api.reports.destroy');

    // Sector Settings API
    Route::get('/settings', [SectorSettingController::class, 'index'])->name('api.settings.index');
    Route::post('/settings', [SectorSettingController::class, 'update'])->name('api.settings.update');

    // Resource Centre & Technical Guidance API
    Route::get('/resources', [ResourceDocumentController::class, 'index'])->name('api.resources.index');
    Route::post('/resources', [ResourceDocumentController::class, 'store'])->name('api.resources.store');
    Route::put('/resources/{resource}', [ResourceDocumentController::class, 'update'])->name('api.resources.update');
    Route::delete('/resources/{resource}', [ResourceDocumentController::class, 'destroy'])->name('api.resources.destroy');
    Route::get('/resources/{resource}/download', [ResourceDocumentController::class, 'download'])->name('api.resources.download');
});

// 4. Authenticated Admin Workspace
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin|coordinator'])->group(function () {
    Route::get('/', fn () => Inertia::render('Dashboard/Home', [
        'initialReports' => Report5W::latest('submitted_at')->get(),
    ]))->name('index');

    Route::get('/dashboard', fn () => Inertia::render('Dashboard/Home', [
        'initialReports' => Report5W::latest('submitted_at')->get(),
    ]))->name('dashboard');

    Route::get('/settings', fn () => Inertia::render('Admin/SectorSettings'))->name('settings');
    Route::get('/users', fn () => Inertia::render('Admin/UserManagement'))->name('users');
    Route::get('/powerbi', fn () => Inertia::render('Admin/PowerBiExport'))->name('powerbi');
});

// Coordinator Workspace
Route::middleware(['auth', 'role:coordinator|admin'])->group(function () {
    Route::get('/coordinator/dashboard', fn () => Inertia::render('Dashboard/CoordinatorDashboard', [
        'initialReports' => Report5W::latest('submitted_at')->get(),
    ]))->name('coordinator.dashboard');
});

// 5. Authentication Pages & Form Submissions
Route::get('/signin', fn () => Inertia::render('AuthPages/SignIn'))->name('signin');
Route::post('/signin', [AuthController::class, 'login']);
Route::get('/signup', fn () => Inertia::render('AuthPages/SignUp'))->name('signup');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// 6. User Profile & System Utility Pages
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', fn () => Inertia::render('UserProfiles'))->name('profile');
    Route::get('/calendar', fn () => Inertia::render('Calendar'))->name('calendar');
    Route::get('/form-elements', fn () => Inertia::render('Forms/FormElements'))->name('form-elements');
    Route::get('/basic-tables', fn () => Inertia::render('Tables/BasicTables'))->name('basic-tables');
    Route::get('/blank', fn () => Inertia::render('Blank'))->name('blank');
});

// 7. Charts & UI Elements
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

// 8. Legacy /TailAdmin Base Path Support
Route::prefix('TailAdmin')->group(function () {
    Route::get('/', fn () => Inertia::render('Dashboard/Home', [
        'initialReports' => Report5W::latest('submitted_at')->get(),
    ]));
    Route::get('/landing', LandingController::class);
    Route::get('/home', LandingController::class);
    Route::get('/dashboard', CoverageDashboardController::class);
    Route::get('/reports-list', [Report5WController::class, 'index']);
    Route::get('/profile', fn () => Inertia::render('UserProfiles'));
    Route::get('/signin', fn () => Inertia::render('AuthPages/SignIn'));
    Route::get('/signup', fn () => Inertia::render('AuthPages/SignUp'));
});

// 9. Fallback 404
Route::fallback(fn () => Inertia::render('OtherPage/NotFound'));
