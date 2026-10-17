<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['mentor_profile_id', 'reviewer_name', 'rating', 'body', 'verified'])]
class MentorReview extends Model
{
    use HasFactory;

    public function mentorProfile(): BelongsTo
    {
        return $this->belongsTo(MentorProfile::class);
    }
}
