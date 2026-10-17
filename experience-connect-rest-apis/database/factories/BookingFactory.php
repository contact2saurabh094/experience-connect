<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $mentor = MentorProfile::factory();

        return [
            'learner_id' => User::factory()->state(['role' => 'learner']),
            'mentor_profile_id' => $mentor,
            'scheduled_at' => now()->addDays(3),
            'duration_minutes' => 30,
            'topic' => fake()->sentence(4),
            'status' => 'upcoming',
            'price' => 49,
        ];
    }
}
