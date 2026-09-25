<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResourceDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'format',
        'size',
        'badge_color',
        'description',
        'highlights',
        'file_name',
        'file_url',
        'download_count',
        'is_published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'highlights' => 'array',
            'is_published' => 'boolean',
            'download_count' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
