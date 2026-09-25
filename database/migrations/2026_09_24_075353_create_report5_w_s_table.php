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
        Schema::create('report5_w_s', function (Blueprint $table) {
            $table->id();
            $table->string('report_code')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('partner_id')->nullable()->constrained('partners')->nullOnDelete();
            $table->timestamp('submitted_at')->useCurrent();
            $table->string('submitted_by_role')->default('partner');
            $table->string('submitted_by_email');
            $table->string('org_name');
            $table->string('org_type');
            $table->string('focal_point');
            $table->string('email');
            $table->string('donor')->nullable();
            $table->string('activity_type');
            $table->decimal('quantity', 12, 2)->default(0);
            $table->string('unit');
            $table->text('indicator_desc')->nullable();
            $table->string('state');
            $table->string('lga');
            $table->string('ward')->nullable();
            $table->string('settlement')->nullable();
            $table->string('location_type')->nullable();
            $table->string('period'); // e.g., 2026-08
            $table->enum('status', ['Planned', 'Ongoing', 'Completed', 'Suspended'])->default('Ongoing');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('population_group')->nullable();
            $table->integer('pwd')->default(0);
            $table->integer('men')->default(0);
            $table->integer('women')->default(0);
            $table->integer('boys')->default(0);
            $table->integer('girls')->default(0);
            $table->integer('total')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report5_w_s');
    }
};
