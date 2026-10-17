<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentor_media', function (Blueprint $table) {
            $table->id();
            $table->string('mentor_profile_id', 80);
            $table->foreign('mentor_profile_id')->references('id')->on('mentor_profiles')->cascadeOnDelete();
            $table->string('kind', 16);
            $table->string('title', 180);
            $table->string('description', 255)->default('');
            $table->string('duration', 20)->nullable();
            $table->string('cover_color', 7)->default('#E8F0FC');
            $table->string('external_url', 2048)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['mentor_profile_id', 'kind', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_media');
    }
};
