<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentorMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'kind' => $this->kind,
            'title' => $this->title,
            'description' => $this->description,
            'duration' => $this->duration,
            'coverColor' => $this->cover_color,
            'url' => $this->external_url,
        ];
    }
}
