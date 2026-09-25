<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'acronym',
        'org_type',
        'focal_point_name',
        'focal_point_email',
        'focal_point_phone',
        'donor',
        'logo_url',
        'states_covered',
        'is_active',
    ];

    protected $casts = [
        'states_covered' => 'array',
        'is_active' => 'boolean',
    ];

    public function reports(): HasMany
    {
        return $this->hasMany(Report5W::class);
    }
}
