<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['mentor_profile_id', 'day_of_week', 'available', 'slots'])]
class MentorAvailability extends Model
{
    protected function casts(): array
    {
        return [
            'available' => 'boolean',
            'slots' => 'array',
        ];
    }

    public function mentorProfile(): BelongsTo
    {
        return $this->belongsTo(MentorProfile::class);
    }
}
