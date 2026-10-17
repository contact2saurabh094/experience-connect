<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'learner_id', 'mentor_profile_id', 'scheduled_at', 'duration_minutes',
    'topic', 'status', 'price',
])]
class Booking extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'immutable_datetime',
            'price' => 'decimal:2',
        ];
    }

    public function learner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'learner_id');
    }

    public function mentorProfile(): BelongsTo
    {
        return $this->belongsTo(MentorProfile::class);
    }
}
