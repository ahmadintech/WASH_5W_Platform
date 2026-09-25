<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Beneficiary extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_5w_id',
        'population_group',
        'men',
        'women',
        'boys',
        'girls',
        'pwd',
        'total',
    ];

    protected $casts = [
        'men' => 'integer',
        'women' => 'integer',
        'boys' => 'integer',
        'girls' => 'integer',
        'pwd' => 'integer',
        'total' => 'integer',
    ];

    public function report5w(): BelongsTo
    {
        return $this->belongsTo(Report5W::class, 'report_5w_id');
    }
}
