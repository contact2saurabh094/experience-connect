<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MentorMediaResource;
use App\Http\Resources\MentorReviewResource;
use App\Models\MentorProfile;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MentorContentController extends Controller
{
    public function reviews(string $mentor): AnonymousResourceCollection
    {
        $profile = $this->publishedMentor($mentor);

        return MentorReviewResource::collection(
            $profile->reviews()->latest()->paginate(20)->withQueryString()
        );
    }

    public function media(string $mentor): AnonymousResourceCollection
    {
        $profile = $this->publishedMentor($mentor);

        return MentorMediaResource::collection(
            $profile->media()->orderBy('sort_order')->paginate(20)->withQueryString()
        );
    }

    private function publishedMentor(string $mentor): MentorProfile
    {
        return MentorProfile::query()->where('is_published', true)->findOrFail($mentor);
    }
}
