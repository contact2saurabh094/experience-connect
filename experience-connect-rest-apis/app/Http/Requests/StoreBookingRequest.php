<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'learner';
    }

    public function rules(): array
    {
        return [
            'mentor_id' => ['required', 'string', 'exists:mentor_profiles,id,is_published,1'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'topic' => ['required', 'string', 'min:3', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'mentor_id.exists' => 'The selected mentor is unavailable.',
            'scheduled_at.after' => 'Choose a session time in the future.',
        ];
    }
}
