<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_learner_can_register_and_receive_a_bearer_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Alex Morgan',
            'email' => 'alex@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.name', 'Alex Morgan')
            ->assertJsonPath('data.user.role', 'learner')
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'role'], 'token']]);
        $this->assertDatabaseHas('users', ['email' => 'alex@example.com', 'role' => 'learner']);
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_registration_rejects_missing_fields_duplicate_emails_and_weak_passwords(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->postJson('/api/auth/register', [])->assertUnprocessable()->assertJsonValidationErrors([
            'name', 'email', 'password',
        ]);
        $this->postJson('/api/auth/register', [
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_login_rejects_invalid_credentials_and_returns_a_token_for_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'learner@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'learner@example.com',
            'password' => 'incorrect-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $response = $this->postJson('/api/auth/login', [
            'email' => 'learner@example.com',
            'password' => 'password123',
        ]);
        $response->assertOk()->assertJsonPath('data.user.id', (string) $user->id);
        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_protected_profile_requires_authentication_and_logout_revokes_the_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonMissingPath('data.password');

        $this->withToken($token)->postJson('/api/auth/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->withToken($token)->getJson('/api/me')->assertUnauthorized();
    }

    public function test_api_authentication_errors_are_json_without_an_accept_header(): void
    {
        $this->call('GET', '/api/me')
            ->assertUnauthorized()
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_changing_to_mentor_creates_a_private_profile_and_weekly_schedule(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->patchJson('/api/me/role', ['role' => 'mentor'])
            ->assertOk()
            ->assertJsonPath('data.role', 'mentor');

        $this->assertDatabaseHas('mentor_profiles', [
            'user_id' => $user->id,
            'is_published' => false,
        ]);
        $this->assertDatabaseCount('mentor_availabilities', 7);
    }
}
