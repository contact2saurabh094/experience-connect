<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MentorAvailabilityController;
use App\Http\Controllers\Api\MentorContentController;
use App\Http\Controllers\Api\MentorController;
use App\Http\Controllers\Api\MentorDashboardController;
use App\Http\Controllers\Api\MentorRequestController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:6,1')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

Route::get('/mentors', [MentorController::class, 'index']);
Route::get('/mentors/{mentor}', [MentorController::class, 'show']);
Route::get('/mentors/{mentor}/reviews', [MentorContentController::class, 'reviews']);
Route::get('/mentors/{mentor}/media', [MentorContentController::class, 'media']);

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me/role', [AuthController::class, 'updateRole']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{mentor}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{mentor}', [FavoriteController::class, 'destroy']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    Route::get('/mentor/availability', [MentorAvailabilityController::class, 'show']);
    Route::put('/mentor/availability', [MentorAvailabilityController::class, 'update']);
    Route::get('/mentor/requests', [MentorRequestController::class, 'index']);
    Route::patch('/mentor/requests/{booking}', [MentorRequestController::class, 'decide']);
    Route::get('/mentor/dashboard', [MentorDashboardController::class, 'show']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read', [NotificationController::class, 'markAllRead']);
});
