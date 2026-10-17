<?php

namespace Database\Factories;

use App\Models\MentorMedia;
use App\Models\MentorProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MentorMedia>
 */
class MentorMediaFactory extends Factory
{
    protected $model = MentorMedia::class;

    public function definition(): array
    {
        return [
            'mentor_profile_id' => MentorProfile::factory(),
            'kind' => 'article',
            'title' => fake()->sentence(5),
            'description' => fake()->sentence(),
            'duration' => null,
            'cover_color' => '#E8F0FC',
            'external_url' => null,
            'sort_order' => 0,
        ];
    }
}
