<?php

namespace Database\Factories;

use App\Models\MentorProfile;
use App\Models\MentorReview;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MentorReview>
 */
class MentorReviewFactory extends Factory
{
    protected $model = MentorReview::class;

    public function definition(): array
    {
        return [
            'mentor_profile_id' => MentorProfile::factory(),
            'reviewer_name' => fake()->name(),
            'rating' => fake()->numberBetween(1, 5),
            'body' => fake()->paragraph(),
            'verified' => true,
        ];
    }
}
