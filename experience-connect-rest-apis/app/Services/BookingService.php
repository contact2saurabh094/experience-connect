<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\MentorProfile;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function create(User $learner, string $mentorId, string $scheduledAt, string $topic): Booking
    {
        return DB::transaction(function () use ($learner, $mentorId, $scheduledAt, $topic): Booking {
            $mentor = MentorProfile::query()->whereKey($mentorId)->lockForUpdate()->firstOrFail();
            $date = now()->parse($scheduledAt);

            if (! $mentor->is_published || $date->isPast()) {
                throw ValidationException::withMessages([
                    'scheduled_at' => 'The selected mentor or session time is unavailable.',
                ]);
            }

            $slotTaken = Booking::query()
                ->where('mentor_profile_id', $mentor->id)
                ->where('scheduled_at', $date)
                ->whereIn('status', ['upcoming', 'pending'])
                ->exists();

            if ($slotTaken) {
                throw ValidationException::withMessages([
                    'scheduled_at' => 'That session time has already been booked.',
                ]);
            }

            $booking = Booking::query()->create([
                'learner_id' => $learner->id,
                'mentor_profile_id' => $mentor->id,
                'scheduled_at' => $date,
                'duration_minutes' => 30,
                'topic' => $topic,
                'status' => 'upcoming',
                'price' => $mentor->price,
            ]);

            UserNotification::query()->create([
                'user_id' => $learner->id,
                'actor_user_id' => $mentor->user_id,
                'booking_id' => $booking->id,
                'kind' => 'booking',
                'message' => 'Your session with '.($mentor->user?->name ?? 'your mentor').' is confirmed.',
            ]);

            return $booking->load(['mentorProfile.user', 'learner']);
        });
    }
}
