<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return NotificationResource::collection(
            $request->user()->notificationsForUser()->with(['actor.mentorProfile'])
                ->latest()->paginate(30)->withQueryString()
        );
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->notificationsForUser()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Notifications marked as read.']);
    }
}
