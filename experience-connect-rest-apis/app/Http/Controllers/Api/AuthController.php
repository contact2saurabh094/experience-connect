<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\MentorAvailability;
use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::query()->create([
            ...$request->validated(),
            'role' => 'learner',
        ]);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $user->createToken('mobile')->plainTextToken,
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $user->createToken('mobile')->plainTextToken,
            ],
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(['data' => new UserResource(request()->user())]);
    }

    public function updateRole(UpdateRoleRequest $request): JsonResponse
    {
        $user = $request->user();
        $role = $request->validated('role');

        DB::transaction(function () use ($user, $role): void {
            $user->update(['role' => $role]);

            if ($role === 'mentor' && ! $user->mentorProfile()->exists()) {
                $profile = MentorProfile::query()->create([
                    'id' => 'mentor-'.$user->id,
                    'user_id' => $user->id,
                    'job_title' => 'Professional mentor',
                    'skills' => [],
                    'bio' => '',
                    'is_published' => false,
                ]);

                foreach (range(0, 6) as $day) {
                    MentorAvailability::query()->create([
                        'mentor_profile_id' => $profile->id,
                        'day_of_week' => $day,
                        'available' => false,
                        'slots' => [],
                    ]);
                }
            }
        });

        return response()->json(['data' => new UserResource($user->refresh())]);
    }

    public function logout(): JsonResponse
    {
        request()->user()->currentAccessToken()?->delete();
        Auth::guard('sanctum')->forgetUser();

        return response()->json(['message' => 'Signed out successfully.']);
    }
}
