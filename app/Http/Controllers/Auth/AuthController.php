<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Handle an authentication attempt.
     */
    public function login(Request $request): JsonResponse|RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'success' => false,
                'message' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ], 429);
        }

        $remember = $request->boolean('remember', true);

        if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $remember)) {
            RateLimiter::clear($throttleKey);
            $request->session()->regenerate();

            /** @var User $user */
            $user = Auth::user();

            if ($user->status === 'Suspended') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been suspended. Please contact the WASH Sector Lead.',
                ], 403);
            }

            $role = $user->roles->first()?->name ?? 'partner';

            return response()->json([
                'success' => true,
                'message' => 'Signed in successfully.',
                'user' => [
                    'id' => 'usr_'.$user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role,
                    'roleTitle' => $user->role_title ?? ($role === 'admin' ? 'Sector Administrator' : ($role === 'coordinator' ? 'State Coordinator' : 'Implementing Partner')),
                    'organization' => $user->organization ?? 'WASH Sector North East Nigeria',
                    'organizationType' => $user->organization_type ?? 'International NGO',
                    'state' => $user->state ?? 'Borno',
                    'lga' => $user->lga ?? 'Maiduguri',
                    'avatar' => $user->avatar ?? 'https://api.dicebear.com/9.x/avataaars/svg?seed='.urlencode($user->name),
                ],
            ]);
        }

        RateLimiter::hit($throttleKey, 60);

        return response()->json([
            'success' => false,
            'message' => 'The provided credentials do not match our records.',
        ], 422);
    }

    /**
     * Get current authenticated user session profile.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'authenticated' => false,
                'user' => null,
            ]);
        }

        $role = $user->roles->first()?->name ?? 'partner';

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => 'usr_'.$user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'roleTitle' => $user->role_title ?? ($role === 'admin' ? 'Sector Administrator' : ($role === 'coordinator' ? 'State Coordinator' : 'Implementing Partner')),
                'organization' => $user->organization ?? 'WASH Sector North East Nigeria',
                'organizationType' => $user->organization_type ?? 'International NGO',
                'state' => $user->state ?? 'Borno',
                'lga' => $user->lga ?? 'Maiduguri',
                'avatar' => $user->avatar ?? 'https://api.dicebear.com/9.x/avataaars/svg?seed='.urlencode($user->name),
            ],
        ]);
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);
        }

        return redirect('/signin');
    }
}
