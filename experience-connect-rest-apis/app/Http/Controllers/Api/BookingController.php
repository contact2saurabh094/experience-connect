<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookings) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if ($user->role === 'mentor') {
            $profileId = $user->mentorProfile?->id;
            $query = Booking::query()->where('mentor_profile_id', $profileId);
        } else {
            $query = $user->bookingsAsLearner();
        }

        if ($request->filled('status')) {
            $status = match ($request->query('status')) {
                'Upcoming' => 'upcoming',
                'Pending' => 'pending',
                'Past' => 'past',
                'Cancelled' => 'cancelled',
                default => $request->query('status'),
            };
            abort_unless(in_array($status, ['upcoming', 'pending', 'past', 'cancelled'], true), 422, 'Unsupported booking status.');
            $query->where('status', $status);
        }

        return BookingResource::collection(
            $query->with(['mentorProfile.user', 'learner'])->orderByDesc('scheduled_at')->paginate(20)->withQueryString()
        );
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $booking = $this->bookings->create(
            $request->user(),
            $validated['mentor_id'],
            $validated['scheduled_at'],
            $validated['topic'],
        );

        return (new BookingResource($booking))
            ->response()
            ->setStatusCode(201);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);
        $booking->update(['status' => 'cancelled']);

        return response()->json(['data' => new BookingResource($booking->load(['mentorProfile.user', 'learner']))]);
    }
}
