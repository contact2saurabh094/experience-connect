<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->string('mentor_profile_id', 80);
            $table->foreign('mentor_profile_id')->references('id')->on('mentor_profiles')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->boolean('available')->default(false);
            $table->json('slots');
            $table->timestamps();
            $table->unique(['mentor_profile_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_availabilities');
    }
};
