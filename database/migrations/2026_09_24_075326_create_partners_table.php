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
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('acronym')->nullable();
            $table->string('org_type'); // e.g. International NGO, National NGO, UN Agency, Government
            $table->string('focal_point_name')->nullable();
            $table->string('focal_point_email')->nullable();
            $table->string('focal_point_phone')->nullable();
            $table->string('donor')->nullable();
            $table->string('logo_url')->nullable();
            $table->json('states_covered')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partners');
    }
};
