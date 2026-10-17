<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookingDecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'mentor';
    }

    public function rules(): array
    {
        return ['decision' => ['required', 'in:accept,decline']];
    }
}
