<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->user?->name ?? $this->name ?? $this->id,
            'initials' => collect(explode(' ', $this->user?->name ?? $this->id))
                ->filter()->take(2)->map(fn (string $part) => mb_substr($part, 0, 1))->implode(''),
            'role' => $this->job_title,
            'company' => $this->company,
            'experience' => $this->experience_years.' years experience',
            'rating' => (float) $this->rating,
            'reviews' => $this->review_count,
            'price' => (float) $this->price,
            'skills' => $this->skills ?? [],
            'availableThisWeek' => $this->available_this_week,
            'bio' => $this->bio,
            'color' => $this->portrait_color,
            'skin' => $this->skin_color,
            'hair' => $this->hair_color,
            'shirt' => $this->shirt_color,
        ];
    }
}
