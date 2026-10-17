<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'mentor';
    }

    public function rules(): array
    {
        return [
            'days' => ['required', 'array', 'size:7'],
            'days.*.day_of_week' => ['required', 'integer', 'between:0,6', 'distinct'],
            'days.*.available' => ['required', 'boolean'],
            'days.*.slots' => ['present', 'array', 'max:12'],
            'days.*.slots.*.start' => ['required', 'date_format:H:i'],
            'days.*.slots.*.end' => ['required', 'date_format:H:i'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ($this->input('days', []) as $dayIndex => $day) {
                    foreach ($day['slots'] ?? [] as $slotIndex => $slot) {
                        if (
                            isset($slot['start'], $slot['end'])
                            && preg_match('/^\d{2}:\d{2}$/', $slot['start'])
                            && preg_match('/^\d{2}:\d{2}$/', $slot['end'])
                            && $slot['end'] <= $slot['start']
                        ) {
                            $validator->errors()->add(
                                "days.$dayIndex.slots.$slotIndex.end",
                                'The slot end must be later than its start.'
                            );
                        }
                    }
                }
            },
        ];
    }
}
