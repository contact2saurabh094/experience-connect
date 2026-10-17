<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'mentor_profile_id', 'kind', 'title', 'description', 'duration',
    'cover_color', 'external_url', 'sort_order',
])]
class MentorMedia extends Model
{
    use HasFactory;

    public function mentorProfile(): BelongsTo
    {
        return $this->belongsTo(MentorProfile::class);
    }
}
