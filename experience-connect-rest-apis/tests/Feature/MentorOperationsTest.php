<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\MentorMedia;
use App\Models\MentorProfile;
use App\Models\MentorReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MentorOperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_can_read_and_replace_all_seven_availability_days(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $this->actingAs($mentor, 'sanctum')->patchJson('/api/me/role', ['role' => 'mentor'])->assertOk();
        $days = collect(range(0, 6))->map(fn (int $day) => [
            'day_of_week' => $day,
            'available' => $day === 1,
            'slots' => $day === 1 ? [['start' => '09:00', 'end' => '10:00']] : [],
        ])->all();

        $this->actingAs($mentor, 'sanctum')
            ->putJson('/api/mentor/availability', ['days' => $days])
            ->assertOk()
            ->assertJsonPath('data.1.available', true)
            ->assertJsonPath('data.1.slots.0.start', '09:00');
        $this->assertDatabaseHas('mentor_availabilities', [
            'mentor_profile_id' => 'mentor-'.$mentor->id,
            'day_of_week' => 1,
            'available' => true,
        ]);
        $this->assertDatabaseHas('mentor_profiles', [
            'user_id' => $mentor->id,
            'available_this_week' => true,
        ]);
        $this->actingAs($mentor, 'sanctum')->getJson('/api/mentor/availability')
            ->assertOk()->assertJsonPath('data.1.available', true);
    }

    public function test_availability_rejects_incomplete_days_bad_times_and_non_mentors(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);
        $this->actingAs($learner, 'sanctum')
            ->putJson('/api/mentor/availability', ['days' => []])
            ->assertForbidden();

        $mentor = User::factory()->create(['role' => 'mentor']);
        $this->actingAs($mentor, 'sanctum')->patchJson('/api/me/role', ['role' => 'mentor']);
        $days = collect(range(0, 6))->map(fn (int $day) => [
            'day_of_week' => $day,
            'available' => true,
            'slots' => [['start' => '11:00', 'end' => '10:00']],
        ])->all();
        $this->actingAs($mentor, 'sanctum')
            ->putJson('/api/mentor/availability', ['days' => $days])
            ->assertUnprocessable();
    }

    public function test_mentor_can_only_decide_their_own_pending_requests(): void
    {
        $owner = User::factory()->create(['role' => 'mentor']);
        $ownerProfile = MentorProfile::factory()->create(['user_id' => $owner->id]);
        $other = User::factory()->create(['role' => 'mentor']);
        $otherProfile = MentorProfile::factory()->create(['user_id' => $other->id]);
        $learner = User::factory()->create(['role' => 'learner']);
        $ownRequest = Booking::factory()->create([
            'learner_id' => $learner->id,
            'mentor_profile_id' => $ownerProfile->id,
            'status' => 'pending',
        ]);
        $otherRequest = Booking::factory()->create([
            'learner_id' => $learner->id,
            'mentor_profile_id' => $otherProfile->id,
            'status' => 'pending',
        ]);

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/mentor/requests')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownRequest->id);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/mentor/requests/{$otherRequest->id}", ['decision' => 'accept'])
            ->assertForbidden();
        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/mentor/requests/{$ownRequest->id}", ['decision' => 'accept'])
            ->assertOk()
            ->assertJsonPath('data.status', 'Upcoming');
        $this->assertDatabaseHas('bookings', ['id' => $ownRequest->id, 'status' => 'upcoming']);
        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/mentor/requests/{$ownRequest->id}", ['decision' => 'decline'])
            ->assertForbidden();
    }

    public function test_notifications_are_private_and_mark_read_only_for_the_current_user(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $profile = MentorProfile::factory()->create(['user_id' => $mentor->id]);
        $learner = User::factory()->create(['role' => 'learner']);
        $other = User::factory()->create(['role' => 'learner']);
        $booking = Booking::factory()->create([
            'learner_id' => $learner->id,
            'mentor_profile_id' => $profile->id,
        ]);
        $notification = $learner->notificationsForUser()->create([
            'actor_user_id' => $mentor->id,
            'booking_id' => $booking->id,
            'kind' => 'booking',
            'message' => 'Your session is confirmed.',
        ]);

        $this->actingAs($other, 'sanctum')->getJson('/api/notifications')
            ->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($learner, 'sanctum')->getJson('/api/notifications')
            ->assertOk()->assertJsonPath('data.0.id', (string) $notification->id);
        $this->actingAs($learner, 'sanctum')->postJson('/api/notifications/read')->assertOk();
        $this->assertDatabaseMissing('user_notifications', ['id' => $notification->id, 'read_at' => null]);
    }

    public function test_published_mentor_content_and_computed_dashboard_values_are_served_from_database(): void
    {
        $mentor = User::factory()->create(['role' => 'mentor']);
        $profile = MentorProfile::factory()->create([
            'user_id' => $mentor->id,
            'is_published' => true,
            'rating' => 4.9,
            'review_count' => 128,
        ]);
        $learner = User::factory()->create(['role' => 'learner']);
        $review = MentorReview::factory()->create([
            'mentor_profile_id' => $profile->id,
            'reviewer_name' => 'Maya Rivers',
            'rating' => 5,
        ]);
        $media = MentorMedia::factory()->create([
            'mentor_profile_id' => $profile->id,
            'kind' => 'video',
            'title' => 'Introduction',
        ]);
        Booking::factory()->create([
            'learner_id' => $learner->id,
            'mentor_profile_id' => $profile->id,
            'status' => 'past',
            'scheduled_at' => now()->startOfMonth()->addDay(),
            'price' => 49,
        ]);
        Booking::factory()->create([
            'learner_id' => $learner->id,
            'mentor_profile_id' => $profile->id,
            'status' => 'upcoming',
        ]);

        $this->getJson("/api/mentors/{$profile->id}/reviews")
            ->assertOk()
            ->assertJsonPath('data.0.id', (string) $review->id)
            ->assertJsonPath('data.0.rating', 5);
        $this->getJson("/api/mentors/{$profile->id}/media")
            ->assertOk()
            ->assertJsonPath('data.0.id', (string) $media->id)
            ->assertJsonPath('data.0.title', 'Introduction');

        $this->actingAs($mentor, 'sanctum')->getJson('/api/mentor/dashboard')
            ->assertOk()
            ->assertJsonPath('data.upcomingCount', 1)
            ->assertJsonPath('data.earningsThisMonth', 49)
            ->assertJsonPath('data.earningsAllTime', 49)
            ->assertJsonPath('data.recentReviews.0.id', (string) $review->id);
    }
}
