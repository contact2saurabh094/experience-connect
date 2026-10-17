<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MentorIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:100'],
            'category' => ['sometimes', 'string', 'max:60'],
            'skills' => ['sometimes', 'string', 'max:300'],
            'min_price' => ['sometimes', 'numeric', 'min:0', 'max:10000'],
            'max_price' => ['sometimes', 'numeric', 'min:0', 'max:10000', 'gte:min_price'],
            'min_rating' => ['sometimes', 'numeric', 'between:0,5'],
            'available' => ['sometimes', 'boolean'],
            'sort' => ['sometimes', 'in:rating,price,experience_years,name'],
            'direction' => ['sometimes', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'between:1,50'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
