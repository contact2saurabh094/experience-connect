<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentor_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('mentor_profile_id', 80);
            $table->foreign('mentor_profile_id')->references('id')->on('mentor_profiles')->cascadeOnDelete();
            $table->string('reviewer_name', 100);
            $table->unsignedTinyInteger('rating');
            $table->text('body');
            $table->boolean('verified')->default(false);
            $table->timestamps();
            $table->index(['mentor_profile_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_reviews');
    }
};
