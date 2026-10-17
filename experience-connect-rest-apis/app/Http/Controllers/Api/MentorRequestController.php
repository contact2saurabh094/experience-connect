<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingDecisionRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MentorRequestController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        abort_unless(request()->user()->role === 'mentor', 403, 'Only mentors can view consultation requests.');
        $profileId = request()->user()->mentorProfile?->id;

        return BookingResource::collection(
            Booking::query()
                ->where('mentor_profile_id', $profileId)
                ->where('status', 'pending')
                ->with(['mentorProfile.user', 'learner'])
                ->orderBy('scheduled_at')
                ->paginate(20)
        );
    }

    public function decide(BookingDecisionRequest $request, Booking $booking): JsonResponse
    {
        $this->authorize('decide', $booking);
        $booking->update([
            'status' => $request->validated('decision') === 'accept' ? 'upcoming' : 'cancelled',
        ]);

        return response()->json([
            'data' => new BookingResource($booking->load(['mentorProfile.user', 'learner'])),
        ]);
    }
}
