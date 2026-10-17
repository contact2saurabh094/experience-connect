<?php

namespace App\Services;

use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MentorService
{
    public function search(array $filters): LengthAwarePaginator
    {
        $query = MentorProfile::query()
            ->with('user')
            ->where('is_published', true);

        $search = trim($filters['search'] ?? '');
        if ($search !== '') {
            $term = '%'.mb_strtolower($search).'%';
            $query->where(function ($builder) use ($term): void {
                $builder->whereHas('user', fn ($user) => $user->whereRaw('LOWER(name) LIKE ?', [$term]))
                    ->orWhereRaw('LOWER(job_title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(company) LIKE ?', [$term]);
            });
        }

        $category = $filters['category'] ?? '';
        if ($category !== '' && $category !== 'All') {
            $query->where(function ($builder) use ($category): void {
                $builder->whereJsonContains('skills', $category)
                    ->orWhereRaw('LOWER(job_title) LIKE ?', ['%'.mb_strtolower($category).'%']);
            });
        }

        $skills = array_values(array_filter(array_map('trim', explode(',', $filters['skills'] ?? ''))));
        if ($skills !== []) {
            $query->where(function ($builder) use ($skills): void {
                foreach ($skills as $skill) {
                    $builder->orWhereJsonContains('skills', $skill);
                }
            });
        }

        $query->when(isset($filters['min_price']), fn ($builder) => $builder->where('price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn ($builder) => $builder->where('price', '<=', $filters['max_price']))
            ->when(isset($filters['min_rating']), fn ($builder) => $builder->where('rating', '>=', $filters['min_rating']))
            ->when(filter_var($filters['available'] ?? false, FILTER_VALIDATE_BOOL), fn ($builder) => $builder->where('available_this_week', true));

        $sort = $filters['sort'] ?? 'rating';
        $direction = $filters['direction'] ?? 'desc';
        if ($sort === 'name') {
            $query->orderBy(
                User::query()
                    ->select('name')
                    ->whereColumn('users.id', 'mentor_profiles.user_id'),
                $direction,
            );
        } else {
            $query->orderBy($sort, $direction);
        }
        $query->orderBy('id');

        return $query->paginate($filters['per_page'] ?? 20)->withQueryString();
    }

    public function visibleMentor(string $id): MentorProfile
    {
        return MentorProfile::query()
            ->with('user')
            ->where('is_published', true)
            ->findOrFail($id);
    }
}
