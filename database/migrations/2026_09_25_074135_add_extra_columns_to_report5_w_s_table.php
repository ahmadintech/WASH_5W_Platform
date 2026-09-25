<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('report5_w_s', function (Blueprint $table) {
            $table->string('acronym')->nullable()->after('org_name');
            $table->string('phone')->nullable()->after('focal_point');
            $table->string('domain')->nullable()->after('donor');
            $table->string('emerg_type')->nullable()->after('domain');
            $table->string('indicator')->nullable()->after('activity_type');
            $table->string('hrp')->nullable()->after('unit');
            $table->decimal('qty_planned', 12, 2)->default(0)->after('hrp');
            $table->decimal('qty_achieved', 12, 2)->default(0)->after('qty_planned');
            $table->string('pcode1')->nullable()->after('state');
            $table->string('pcode2')->nullable()->after('lga');
            $table->string('pcode3')->nullable()->after('ward');
            $table->string('site_type')->nullable()->after('settlement');
            $table->string('location_name')->nullable()->after('site_type');
            $table->string('location_pop')->nullable()->after('location_name');
            $table->string('latlong')->nullable()->after('location_pop');
            $table->decimal('latitude', 10, 7)->nullable()->after('latlong');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('benef_type')->nullable()->after('population_group');
            $table->text('comments')->nullable()->after('total');
            $table->string('impl_partners')->nullable()->after('donor');
            $table->string('report_month')->nullable()->after('period');
            $table->string('report_date')->nullable()->after('report_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report5_w_s', function (Blueprint $table) {
            $table->dropColumn([
                'acronym',
                'phone',
                'domain',
                'emerg_type',
                'indicator',
                'hrp',
                'qty_planned',
                'qty_achieved',
                'pcode1',
                'pcode2',
                'pcode3',
                'site_type',
                'location_name',
                'location_pop',
                'latlong',
                'latitude',
                'longitude',
                'benef_type',
                'comments',
                'impl_partners',
                'report_month',
                'report_date',
            ]);
        });
    }
};
