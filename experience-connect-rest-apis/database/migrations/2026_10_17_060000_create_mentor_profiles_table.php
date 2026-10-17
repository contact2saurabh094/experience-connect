<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentor_profiles', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('job_title');
            $table->string('company')->default('');
            $table->unsignedSmallInteger('experience_years')->default(0);
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->decimal('price', 8, 2)->unsigned()->default(0);
            $table->json('skills');
            $table->text('bio');
            $table->boolean('available_this_week')->default(false)->index();
            $table->boolean('is_published')->default(false)->index();
            $table->string('portrait_color', 7)->default('#DCEAF3');
            $table->string('skin_color', 7)->default('#BB8067');
            $table->string('hair_color', 7)->default('#282C38');
            $table->string('shirt_color', 7)->default('#345778');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_profiles');
    }
};
