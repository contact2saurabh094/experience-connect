<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentorReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $initials = collect(explode(' ', $this->reviewer_name))
            ->filter()->take(2)->map(fn (string $part) => mb_substr($part, 0, 1))->implode('');

        return [
            'id' => (string) $this->id,
            'name' => $this->reviewer_name,
            'initials' => $initials,
            'rating' => $this->rating,
            'text' => $this->body,
            'time' => $this->created_at?->diffForHumans(),
            'verified' => $this->verified,
        ];
    }
}
