<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->actor?->name ?? 'Experience Connect',
            'avatarId' => $this->actor?->mentorProfile?->id,
            'text' => $this->message,
            'time' => $this->created_at?->diffForHumans(),
            'kind' => ucfirst($this->kind),
            'read' => $this->read_at !== null,
        ];
    }
}
