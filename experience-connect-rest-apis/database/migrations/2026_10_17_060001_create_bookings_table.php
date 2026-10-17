<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('learner_id')->constrained('users')->cascadeOnDelete();
            $table->string('mentor_profile_id', 80);
            $table->foreign('mentor_profile_id')->references('id')->on('mentor_profiles')->cascadeOnDelete();
            $table->dateTime('scheduled_at');
            $table->unsignedTinyInteger('duration_minutes')->default(30);
            $table->string('topic', 120);
            $table->string('status')->default('upcoming')->index();
            $table->decimal('price', 8, 2)->unsigned();
            $table->timestamps();
            $table->index(['learner_id', 'scheduled_at']);
            $table->index(['mentor_profile_id', 'status', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
