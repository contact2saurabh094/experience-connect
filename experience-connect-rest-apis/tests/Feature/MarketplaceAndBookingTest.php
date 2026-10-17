<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\MentorProfile;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MarketplaceAndBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_search_supports_filters_sorting_and_pagination(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $this->actingAs($learner, 'sanctum');
        $expensive = $this->mentor(['job_title' => 'Senior Product Manager', 'price' => 80, 'rating' => 4.8, 'skills' => ['Technology']]);
        $affordable = $this->mentor(['job_title' => 'Product Designer', 'price' => 35, 'rating' => 4.9, 'skills' => ['Design']]);
        $this->mentor(['job_title' => 'Marketing Lead', 'price' => 45, 'rating' => 4.5, 'skills' => ['Marketing']]);

        $response = $this->getJson('/api/mentors?search=product&min_price=30&max_price=90&sort=price&direction=asc&per_page=1');
        $response->assertOk()
            ->assertJsonPath('data.0.id', $affordable->id)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonStructure(['data' => [['id', 'name', 'role', 'skills', 'price']], 'meta']);
        $this->assertNotSame($expensive->id, $response->json('data.0.id'));
    }

    public function test_learners_can_save_and_remove_published_mentors(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $mentor = $this->mentor();

        $this->actingAs($learner, 'sanctum')
            ->postJson("/api/favorites/{$mentor->id}")
            ->assertCreated();
        $this->assertDatabaseHas('mentor_favorites', [
            'user_id' => $learner->id,
            'mentor_profile_id' => $mentor->id,
        ]);
        $this->actingAs($learner, 'sanctum')
            ->getJson('/api/favorites')
            ->assertOk()
            ->assertJsonPath('data.0.id', $mentor->id);
        $this->actingAs($learner, 'sanctum')
            ->deleteJson("/api/favorites/{$mentor->id}")
            ->assertOk();
        $this->assertDatabaseMissing('mentor_favorites', ['user_id' => $learner->id]);
    }

    public function test_mentor_role_cannot_manage_learner_favorites(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $this->actingAs($mentor, 'sanctum')->getJson('/api/favorites')->assertForbidden();
    }

    public function test_booking_creation_persists_a_confirmation_notification_and_enforces_slot_conflicts(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $mentor = $this->mentor();
        $schedule = now()->addDays(4)->startOfHour()->toISOString();
        $payload = ['mentor_id' => $mentor->id, 'scheduled_at' => $schedule, 'topic' => 'Career consultation'];

        $response = $this->actingAs($learner, 'sanctum')->postJson('/api/bookings', $payload);
        $response->assertCreated()
            ->assertJsonPath('data.mentorId', $mentor->id)
            ->assertJsonPath('data.status', 'Upcoming')
            ->assertJsonPath('data.topic', 'Career consultation');
        $this->assertDatabaseHas('bookings', [
            'learner_id' => $learner->id,
            'mentor_profile_id' => $mentor->id,
            'status' => 'upcoming',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $learner->id,
            'kind' => 'booking',
        ]);

        $this->actingAs($learner, 'sanctum')->postJson('/api/bookings', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('scheduled_at');
    }

    public function test_booking_validation_and_role_checks_reject_invalid_requests(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $mentor = $this->mentor();

        $this->actingAs($learner, 'sanctum')->postJson('/api/bookings', [
            'mentor_id' => 'missing-profile',
            'scheduled_at' => now()->addDay()->toISOString(),
            'topic' => 'Okay',
        ])->assertUnprocessable()->assertJsonValidationErrors('mentor_id');

        $this->actingAs($learner, 'sanctum')->postJson('/api/bookings', [
            'mentor_id' => $mentor->id,
            'scheduled_at' => now()->subDay()->toISOString(),
            'topic' => 'Career',
        ])->assertUnprocessable()->assertJsonValidationErrors('scheduled_at');

        $mentorUser = User::factory()->create(['role' => 'mentor']);
        $this->actingAs($mentorUser, 'sanctum')->postJson('/api/bookings', [
            'mentor_id' => $mentor->id,
            'scheduled_at' => now()->addDay()->toISOString(),
            'topic' => 'Career',
        ])->assertForbidden();
    }

    public function test_only_the_owning_learner_can_cancel_an_upcoming_booking(): void
    {
        $mentor = $this->mentor();
        $owner = User::factory()->create(['role' => 'learner']);
        $other = User::factory()->create(['role' => 'learner']);
        $booking = Booking::factory()->create([
            'learner_id' => $owner->id,
            'mentor_profile_id' => $mentor->id,
        ]);

        $this->actingAs($other, 'sanctum')->patchJson("/api/bookings/{$booking->id}/cancel")->assertForbidden();
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'upcoming']);

        $this->actingAs($owner, 'sanctum')->patchJson("/api/bookings/{$booking->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'Cancelled');
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'cancelled']);
    }

    public function test_booking_service_rolls_back_when_its_notification_write_fails(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $mentor = $this->mentor();
        DB::statement("CREATE TRIGGER reject_notification BEFORE INSERT ON user_notifications BEGIN SELECT RAISE(ABORT, 'forced failure'); END");

        try {
            app(BookingService::class)->create(
                $learner,
                $mentor->id,
                now()->addDays(5)->toISOString(),
                'Career consultation',
            );
            $this->fail('The notification trigger should make the transaction fail.');
        } catch (QueryException) {
            $this->assertDatabaseCount('bookings', 0);
            $this->assertDatabaseCount('user_notifications', 0);
        }
    }

    private function mentor(array $attributes = []): MentorProfile
    {
        $owner = User::factory()->create(['role' => 'mentor']);

        return MentorProfile::factory()->create([
            'user_id' => $owner->id,
            'is_published' => true,
            ...$attributes,
        ]);
    }
}
