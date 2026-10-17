<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Http\Resources\MentorReviewResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentorDashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'mentor', 403, 'Only mentors can view the mentor dashboard.');
        $profile = $request->user()->mentorProfile()->withCount('bookings')->firstOrFail();
        $bookings = Booking::query()->where('mentor_profile_id', $profile->id);
        $completed = (clone $bookings)->where('status', 'past');

        return response()->json([
            'data' => [
                'upcomingCount' => (clone $bookings)->where('status', 'upcoming')->count(),
                'pendingCount' => (clone $bookings)->where('status', 'pending')->count(),
                'completedCount' => (clone $completed)->count(),
                'rating' => (float) $profile->rating,
                'reviews' => $profile->review_count,
                'earningsThisMonth' => (float) (clone $completed)
                    ->whereBetween('scheduled_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->sum('price'),
                'earningsLastMonth' => (float) (clone $completed)
                    ->whereBetween('scheduled_at', [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()])
                    ->sum('price'),
                'earningsAllTime' => (float) (clone $completed)->sum('price'),
                'recentReviews' => MentorReviewResource::collection(
                    $profile->reviews()->latest()->limit(3)->get()
                ),
                'upcoming' => BookingResource::collection(
                    (clone $bookings)->where('status', 'upcoming')->with(['mentorProfile.user', 'learner'])
                        ->orderBy('scheduled_at')->limit(3)->get()
                ),
            ],
        ]);
    }
}
