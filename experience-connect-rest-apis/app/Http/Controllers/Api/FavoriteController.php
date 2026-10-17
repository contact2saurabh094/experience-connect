<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MentorResource;
use App\Models\MentorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FavoriteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->ensureLearner($request);

        return MentorResource::collection(
            $request->user()->favoriteMentors()->with('user')->where('is_published', true)->orderBy('id')->get()
        );
    }

    public function store(Request $request, string $mentor): JsonResponse
    {
        $this->ensureLearner($request);
        $profile = MentorProfile::query()->where('is_published', true)->findOrFail($mentor);
        $request->user()->favoriteMentors()->syncWithoutDetaching([$profile->id]);

        return response()->json(['message' => 'Mentor saved.'], 201);
    }

    public function destroy(Request $request, string $mentor): JsonResponse
    {
        $this->ensureLearner($request);
        $request->user()->favoriteMentors()->detach($mentor);

        return response()->json(['message' => 'Mentor removed from saved profiles.']);
    }

    private function ensureLearner(Request $request): void
    {
        abort_unless($request->user()->role === 'learner', 403, 'Only learners can manage saved mentors.');
    }
}
