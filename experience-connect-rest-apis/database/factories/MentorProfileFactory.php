<?php

namespace Database\Factories;

use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MentorProfile>
 */
class MentorProfileFactory extends Factory
{
    protected $model = MentorProfile::class;

    public function definition(): array
    {
        $name = fake()->name();

        return [
            'id' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 99999),
            'user_id' => User::factory()->state(['role' => 'mentor']),
            'job_title' => fake()->jobTitle(),
            'company' => fake()->company(),
            'experience_years' => fake()->numberBetween(1, 25),
            'rating' => fake()->randomFloat(1, 3.5, 5),
            'review_count' => fake()->numberBetween(0, 200),
            'price' => fake()->randomFloat(2, 20, 100),
            'skills' => [fake()->randomElement(['Technology', 'Business', 'Design', 'Career'])],
            'bio' => fake()->paragraph(),
            'available_this_week' => fake()->boolean(),
            'is_published' => true,
        ];
    }
}
