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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role_title')->nullable()->after('name');
            $table->string('organization')->nullable()->after('email');
            $table->string('organization_type')->nullable()->after('organization');
            $table->string('state')->nullable()->after('organization_type'); // 'Borno', 'Adamawa', 'Yobe'
            $table->string('lga')->nullable()->after('state');
            $table->string('status')->default('Active')->after('lga');
            $table->string('avatar')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role_title',
                'organization',
                'organization_type',
                'state',
                'lga',
                'status',
                'avatar',
            ]);
        });
    }
};
