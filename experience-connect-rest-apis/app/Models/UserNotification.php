<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'actor_user_id', 'booking_id', 'kind', 'message', 'read_at'])]
class UserNotification extends Model
{
    protected $table = 'user_notifications';

    protected function casts(): array
    {
        return ['read_at' => 'immutable_datetime'];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
