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
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_5w_id')->constrained('report5_w_s')->cascadeOnDelete();
            $table->string('population_group');
            $table->integer('men')->default(0);
            $table->integer('women')->default(0);
            $table->integer('boys')->default(0);
            $table->integer('girls')->default(0);
            $table->integer('pwd')->default(0);
            $table->integer('total')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
