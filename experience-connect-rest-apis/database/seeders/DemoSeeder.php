<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\MentorAvailability;
use App\Models\MentorMedia;
use App\Models\MentorProfile;
use App\Models\MentorReview;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $learner = User::query()->updateOrCreate(
            ['email' => 'learner@example.com'],
            ['name' => 'Alex Morgan', 'role' => 'learner', 'password' => Hash::make('demo12345')]
        );

        $mentors = [
            ['rahul-sharma', 'Rahul Sharma', 'Senior Product Manager', 'TechFlow', 12, 4.9, 128, 49, ['Technology', 'Career', 'Product'], true, 'I help early-career professionals find clarity, build confidence, and take their next big career step. Currently leading product at TechFlow.', '#DCEAF3', '#BB8067', '#282C38', '#345778'],
            ['priya-singh', 'Priya Singh', 'Growth Marketing Lead', 'Brightside', 8, 4.8, 96, 39, ['Marketing', 'Business', 'Career'], true, 'Growth strategist helping ambitious teams turn good ideas into measurable impact. Let’s make your next move a confident one.', '#F5E8E3', '#D39A79', '#392A26', '#A96F7F'],
            ['amara-okafor', 'Amara Okafor', 'UX Design Director', 'Northstar', 10, 5.0, 74, 55, ['Design', 'Technology', 'Career'], false, 'Design leader, creative problem solver, and mentor. I’m passionate about helping designers grow their craft and find their voice.', '#EFE7F5', '#8D5745', '#252330', '#655A9C'],
            ['vikas-saxena', 'Vikas Saxena', 'Finance Director', 'Apex Partners', 15, 4.9, 112, 59, ['Finance', 'Business', 'Career'], true, 'Finance leader and lifelong learner. I help future leaders strengthen their commercial skills and navigate the world of business.', '#E5EBE5', '#C28E70', '#33302D', '#527A70'],
            ['neha-gupta', 'Neha Gupta', 'People & Culture Partner', 'PeopleFirst', 7, 4.9, 63, 42, ['Business', 'Career', 'Leadership'], false, 'People partner, empathetic listener, and career coach. I support thoughtful career changes and confident interview preparation.', '#F4EBDD', '#CF9478', '#352924', '#C17B49'],
            ['daniel-lee', 'Daniel Lee', 'Software Engineering Manager', 'CloudNine', 11, 4.7, 89, 45, ['Technology', 'Leadership', 'Career'], true, 'Engineering manager focused on helping software developers grow into confident technical leaders.', '#E5EAF5', '#E0B69C', '#30343B', '#586DA4'],
        ];

        $profiles = [];
        foreach ($mentors as $row) {
            [$id, $name, $jobTitle, $company, $years, $rating, $reviews, $price, $skills, $available, $bio, $color, $skin, $hair, $shirt] = $row;
            $email = str_replace('-', '.', $id).'@example.com';
            $user = User::query()->updateOrCreate(
                ['email' => $email],
                ['name' => $name, 'role' => 'mentor', 'password' => Hash::make('demo12345')]
            );

            $profile = MentorProfile::query()->updateOrCreate(
                ['id' => $id],
                [
                    'user_id' => $user->id,
                    'job_title' => $jobTitle,
                    'company' => $company,
                    'experience_years' => $years,
                    'rating' => $rating,
                    'review_count' => $reviews,
                    'price' => $price,
                    'skills' => $skills,
                    'bio' => $bio,
                    'available_this_week' => $available,
                    'is_published' => true,
                    'portrait_color' => $color,
                    'skin_color' => $skin,
                    'hair_color' => $hair,
                    'shirt_color' => $shirt,
                ]
            );
            $profiles[$id] = $profile;
            $profile->reviews()->delete();
            $profile->media()->delete();

            foreach ([
                ['Maya Rivers', 5, 'An incredibly thoughtful mentor. I left with a clear plan and the confidence to make my next move.'],
                ['Arjun Kumar', 5, 'Practical advice, generous with their time, and genuinely interested in helping me succeed.'],
                ['Sofia Lopez', 5, 'The portfolio feedback was detailed and immediately useful. Highly recommend booking a session.'],
            ] as [$reviewer, $rating, $body]) {
                MentorReview::query()->create([
                    'mentor_profile_id' => $profile->id,
                    'reviewer_name' => $reviewer,
                    'rating' => $rating,
                    'body' => $body,
                    'verified' => true,
                    'created_at' => now()->subWeeks(2),
                    'updated_at' => now()->subWeeks(2),
                ]);
            }

            foreach ([
                ['video', 'Introduction', 'Meet your mentor and hear how they can help.', '2:14', $color, 0],
                ['video', 'Growing into leadership', 'Practical lessons from the mentor’s experience.', '8 min', '#E8F0FC', 1],
                ['video', 'A portfolio that stands out', 'Ideas for sharing your work with confidence.', '12 min', '#F6ECE3', 2],
                ['video', 'Finding your next role', 'A focused approach to planning your next move.', '6 min', '#E8F0FC', 3],
                ['article', 'A guide to thoughtful career moves', 'A practical read · 5 min', null, '#EEF4FF', 4],
                ['article', 'Ways to make your portfolio shine', 'A practical read · 5 min', null, '#F7EADD', 5],
            ] as [$kind, $title, $description, $duration, $cover, $order]) {
                MentorMedia::query()->create([
                    'mentor_profile_id' => $profile->id,
                    'kind' => $kind,
                    'title' => $title,
                    'description' => $description,
                    'duration' => $duration,
                    'cover_color' => $cover,
                    'sort_order' => $order,
                ]);
            }

            foreach (range(0, 6) as $day) {
                MentorAvailability::query()->updateOrCreate(
                    ['mentor_profile_id' => $id, 'day_of_week' => $day],
                    [
                        'available' => $available && in_array($day, [0, 1, 3, 5], true),
                        'slots' => $available ? [
                            ['start' => '09:00', 'end' => '10:00'],
                            ['start' => '10:00', 'end' => '11:00'],
                        ] : [],
                    ]
                );
            }
        }

        $learner->favoriteMentors()->syncWithoutDetaching(['amara-okafor']);
        $rahul = $profiles['rahul-sharma'];
        $priya = $profiles['priya-singh'];
        $amara = $profiles['amara-okafor'];
        $upcoming = Booking::query()->updateOrCreate(
            ['id' => '00000000-0000-4000-8000-000000000001'],
            [
                'learner_id' => $learner->id,
                'mentor_profile_id' => $rahul->id,
                'scheduled_at' => now()->addDays(2)->setTime(10, 30),
                'topic' => 'Career consultation',
                'status' => 'upcoming',
                'price' => $rahul->price,
            ]
        );
        Booking::query()->updateOrCreate(
            ['id' => '00000000-0000-4000-8000-000000000002'],
            [
                'learner_id' => $learner->id,
                'mentor_profile_id' => $priya->id,
                'scheduled_at' => now()->subDays(20)->setTime(14, 0),
                'topic' => 'Growth marketing career',
                'status' => 'past',
                'price' => $priya->price,
            ]
        );
        Booking::query()->updateOrCreate(
            ['id' => '00000000-0000-4000-8000-000000000003'],
            [
                'learner_id' => $learner->id,
                'mentor_profile_id' => $amara->id,
                'scheduled_at' => now()->subDays(35)->setTime(11, 0),
                'topic' => 'Portfolio review',
                'status' => 'past',
                'price' => $amara->price,
            ]
        );

        foreach ([
            ['00000000-0000-4000-8000-000000000004', 'Jamie Walker', 'jamie.walker@example.com', $profiles['rahul-sharma'], 'Breaking into product management'],
            ['00000000-0000-4000-8000-000000000005', 'Sam Taylor', 'sam.taylor@example.com', $profiles['rahul-sharma'], 'Preparing for a product leadership interview'],
        ] as [$bookingId, $name, $email, $mentor, $topic]) {
            $requester = User::query()->updateOrCreate(
                ['email' => $email],
                ['name' => $name, 'role' => 'learner', 'password' => Hash::make('demo12345')]
            );
            Booking::query()->updateOrCreate(
                ['id' => $bookingId],
                [
                    'learner_id' => $requester->id,
                    'mentor_profile_id' => $mentor->id,
                    'scheduled_at' => now()->addDays(1)->setTime(14, 0),
                    'topic' => $topic,
                    'status' => 'pending',
                    'price' => $mentor->price,
                ]
            );
        }

        UserNotification::query()->updateOrCreate(
            ['user_id' => $learner->id, 'booking_id' => $upcoming->id, 'kind' => 'booking'],
            [
                'actor_user_id' => $rahul->user_id,
                'message' => 'Your upcoming session is confirmed.',
                'read_at' => null,
            ]
        );
    }
}
