<?php

namespace App\Http\Controllers;

use App\Models\ResourceDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResourceDocumentController extends Controller
{
    /**
     * Display a listing of the resource documents.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ResourceDocument::query();

        if (! $request->user() || ! $request->user()->hasAnyRole(['admin', 'coordinator'])) {
            $query->where('is_published', true);
        }

        $resources = $query->orderBy('sort_order', 'asc')->latest()->get();

        return response()->json([
            'success' => true,
            'resources' => $resources,
        ]);
    }

    /**
     * Store a newly created resource document.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'format' => 'required|string|max:50',
            'size' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'highlights' => 'nullable|array',
            'file_name' => 'required|string|max:255',
            'file_url' => 'nullable|string',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $resource = ResourceDocument::create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'format' => $validated['format'],
            'size' => $validated['size'] ?? '1.5 MB',
            'badge_color' => $validated['badge_color'] ?? '#12707E',
            'description' => $validated['description'] ?? '',
            'highlights' => $validated['highlights'] ?? [],
            'file_name' => $validated['file_name'],
            'file_url' => $validated['file_url'] ?? null,
            'is_published' => $validated['is_published'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Technical guidance document created successfully.',
            'resource' => $resource,
        ], 201);
    }

    /**
     * Update the specified resource document.
     */
    public function update(Request $request, ResourceDocument $resource): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'format' => 'sometimes|required|string|max:50',
            'size' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'highlights' => 'nullable|array',
            'file_name' => 'sometimes|required|string|max:255',
            'file_url' => 'nullable|string',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $resource->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Technical guidance document updated successfully.',
            'resource' => $resource,
        ]);
    }

    /**
     * Remove the specified resource document.
     */
    public function destroy(ResourceDocument $resource): JsonResponse
    {
        $resource->delete();

        return response()->json([
            'success' => true,
            'message' => 'Resource document deleted successfully.',
        ]);
    }

    /**
     * Track and download resource.
     */
    public function download(ResourceDocument $resource)
    {
        $resource->increment('download_count');

        if ($resource->file_url && filter_var($resource->file_url, FILTER_VALIDATE_URL)) {
            return redirect($resource->file_url);
        }

        // Return standard response header for document download simulation or attachment
        return response()->json([
            'success' => true,
            'download_url' => $resource->file_url ?: '#',
            'file_name' => $resource->file_name,
            'download_count' => $resource->download_count,
        ]);
    }
}
