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
        'acronym',
        'org_type',
        'focal_point',
        'phone',
        'email',
        'donor',
        'impl_partners',
        'domain',
        'emerg_type',
        'activity_type',
        'indicator',
        'indicator_desc',
        'quantity',
        'unit',
        'hrp',
        'qty_planned',
        'qty_achieved',
        'state',
        'pcode1',
        'lga',
        'pcode2',
        'ward',
        'pcode3',
        'site_type',
        'location_name',
        'location_pop',
        'settlement',
        'location_type',
        'latlong',
        'latitude',
        'longitude',
        'period',
        'report_month',
        'report_date',
        'status',
        'start_date',
        'end_date',
        'population_group',
        'benef_type',
        'pwd',
        'men',
        'women',
        'boys',
        'girls',
        'total',
        'comments',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'quantity' => 'decimal:2',
        'qty_planned' => 'decimal:2',
        'qty_achieved' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
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
