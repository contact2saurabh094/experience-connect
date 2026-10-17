<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = match ($this->status) {
            'upcoming' => 'Upcoming',
            'pending' => 'Pending',
            'cancelled' => 'Cancelled',
            default => 'Past',
        };

        return [
            'id' => $this->id,
            'mentorId' => $this->mentor_profile_id,
            'mentor' => new MentorResource($this->whenLoaded('mentorProfile')),
            'learner' => $this->whenLoaded('learner', fn () => [
                'id' => (string) $this->learner->id,
                'name' => $this->learner->name,
            ]),
            'scheduledAt' => $this->scheduled_at?->toISOString(),
            'date' => $this->scheduled_at?->format('D, d M'),
            'time' => $this->scheduled_at?->format('g:i A'),
            'status' => $status,
            'topic' => $this->topic,
            'durationMinutes' => $this->duration_minutes,
            'price' => (float) $this->price,
        ];
    }
}
