<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        return $booking->learner_id === $user->id
            || $booking->mentorProfile()->where('user_id', $user->id)->exists();
    }

    public function cancel(User $user, Booking $booking): bool
    {
        return $booking->learner_id === $user->id && $booking->status === 'upcoming';
    }

    public function decide(User $user, Booking $booking): bool
    {
        return $user->role === 'mentor'
            && $booking->status === 'pending'
            && $booking->mentorProfile()->where('user_id', $user->id)->exists();
    }
}
