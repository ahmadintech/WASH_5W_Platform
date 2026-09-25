<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function index(Request $request): Response
    {
        $partners = Partner::withCount('reports')->latest()->get();

        return Inertia::render('Wash/PartnersDirectory', [
            'partners' => $partners,
        ]);
    }
}
