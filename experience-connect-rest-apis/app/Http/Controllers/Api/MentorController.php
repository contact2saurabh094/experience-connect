<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MentorIndexRequest;
use App\Http\Resources\MentorResource;
use App\Services\MentorService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MentorController extends Controller
{
    public function __construct(private readonly MentorService $mentors) {}

    public function index(MentorIndexRequest $request): AnonymousResourceCollection
    {
        return MentorResource::collection($this->mentors->search($request->validated()));
    }

    public function show(string $mentor): MentorResource
    {
        return new MentorResource($this->mentors->visibleMentor($mentor));
    }
}
