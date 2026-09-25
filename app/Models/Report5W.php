<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Report5W extends Model
{
    use HasFactory;

    protected $table = 'report5_w_s';

    protected $fillable = [
        'report_code',
        'user_id',
        'partner_id',
        'submitted_at',
        'submitted_by_role',
        'submitted_by_email',
        'org_name',
        'org_type',
        'focal_point',
        'email',
        'donor',
        'activity_type',
        'quantity',
        'unit',
        'indicator_desc',
        'state',
        'lga',
        'ward',
        'settlement',
        'location_type',
        'period',
        'status',
        'start_date',
        'end_date',
        'population_group',
        'pwd',
        'men',
        'women',
        'boys',
        'girls',
        'total',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'quantity' => 'decimal:2',
        'pwd' => 'integer',
        'men' => 'integer',
        'women' => 'integer',
        'boys' => 'integer',
        'girls' => 'integer',
        'total' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function beneficiary(): HasOne
    {
        return $this->hasOne(Beneficiary::class, 'report_5w_id');
    }
}
