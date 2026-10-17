<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAvailabilityRequest;
use App\Models\MentorAvailability;
use App\Models\MentorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MentorAvailabilityController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $this->mentorProfile($request);
        $availability = $profile->availabilities()->get()->keyBy('day_of_week');

        return response()->json([
            'data' => collect(range(0, 6))->map(fn (int $day) => [
                'dayOfWeek' => $day,
                'available' => (bool) ($availability->get($day)?->available ?? false),
                'slots' => $availability->get($day)?->slots ?? [],
            ])->values(),
        ]);
    }

    public function update(StoreAvailabilityRequest $request): JsonResponse
    {
        $profile = $this->mentorProfile($request);

        DB::transaction(function () use ($request, $profile): void {
            foreach ($request->validated('days') as $day) {
                MentorAvailability::query()->updateOrCreate(
                    [
                        'mentor_profile_id' => $profile->id,
                        'day_of_week' => $day['day_of_week'],
                    ],
                    [
                        'available' => $day['available'],
                        'slots' => $day['slots'],
                    ],
                );
            }

            $profile->update([
                'available_this_week' => $profile->availabilities()->where('available', true)->exists(),
            ]);
        });

        return $this->show($request);
    }

    private function mentorProfile(Request $request): MentorProfile
    {
        abort_unless($request->user()->role === 'mentor', 403, 'Only mentors can manage availability.');

        return $request->user()->mentorProfile()->firstOrFail();
    }
}
