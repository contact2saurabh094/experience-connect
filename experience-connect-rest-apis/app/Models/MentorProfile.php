<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id', 'user_id', 'job_title', 'company', 'experience_years', 'rating',
    'review_count', 'price', 'skills', 'bio', 'available_this_week',
    'is_published', 'portrait_color', 'skin_color', 'hair_color', 'shirt_color',
])]
class MentorProfile extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'available_this_week' => 'boolean',
            'is_published' => 'boolean',
            'price' => 'decimal:2',
            'rating' => 'decimal:1',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(MentorAvailability::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(MentorReview::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(MentorMedia::class);
    }
}
