# Experience Connect REST API

Laravel 13 REST API for the Experience Connect Expo app. It uses Sanctum bearer tokens for mobile authentication and MySQL for development data.

## Requirements and installation

- PHP 8.3+ with `pdo_mysql` and the usual Laravel extensions
- Composer 2.8+
- MySQL 8+

From this directory:

```sh
composer install
copy .env.example .env
php artisan key:generate
```

Create a local database and restricted development user in MySQL (choose a local password and replace the example):

```sql
CREATE DATABASE experience_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'experience_connect_user'@'127.0.0.1' IDENTIFIED BY 'replace-with-a-local-secret';
GRANT ALL PRIVILEGES ON experience_connect.* TO 'experience_connect_user'@'localhost';
FLUSH PRIVILEGES;
```

Set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in the ignored `.env` file. `.env.example` documents placeholders only. The backend defaults MySQL/MariaDB table creation to InnoDB so indexes and foreign keys work even if the server has a different default engine. Then migrate and optionally seed local demo data:

```sh
php artisan migrate
php artisan db:seed --class=DemoSeeder
php artisan serve --host=0.0.0.0 --port=8000
```

`DemoSeeder` is a development fixture and is not run by default in production. It is repeatable for its known fixture emails. Demo login accounts use password `demo12345`: `learner@example.com` (learner) and `rahul.sharma@example.com` (mentor).

## Frontend API configuration

Configure `EXPO_PUBLIC_API_URL` in the app root `.env` with the `/api` suffix:

| Client | Example base URL |
|---|---|
| Android emulator | `http://10.0.2.2:8000/api` |
| iOS simulator or web on the development computer | `http://127.0.0.1:8000/api` |
| Physical device | `http://<computer-LAN-IP>:8000/api` |

The Laravel server must listen on `0.0.0.0` and the computer firewall must allow the device. Native API tokens are stored in Expo SecureStore; web uses `localStorage`. Requests use `Authorization: Bearer <token>`. Registration creates a learner account; selecting the mentor role creates a private starter profile and weekly availability, which must be published by a future mentor-profile workflow before it appears in marketplace search.

## Authentication and authorization

- `POST /api/auth/register` and `POST /api/auth/login` return a Sanctum bearer token.
- Protected endpoints require `Authorization: Bearer <token>`.
- `GET /api/me`, `PATCH /api/me/role`, and `POST /api/auth/logout` manage the authenticated profile and token.
- Learner-only and mentor-only operations validate role server-side. Booking cancellation and mentor request decisions are constrained to the owning learner or mentor. Notifications and favorites are scoped to the signed-in user.
- Public endpoints expose only published mentor profiles and their public review/media metadata.

## Endpoint map

All paths below are prefixed with `/api`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public; rate-limited | Register learner |
| POST | `/auth/login` | Public; rate-limited | Issue token |
| GET | `/me` | Authenticated | Read profile |
| PATCH | `/me/role` | Authenticated | Select learner/mentor role |
| POST | `/auth/logout` | Authenticated | Revoke current token |
| GET | `/mentors` | Public | Search, filter, sort, paginate published mentors |
| GET | `/mentors/{mentor}` | Public | Read mentor profile |
| GET | `/mentors/{mentor}/reviews` | Public | Read mentor reviews |
| GET | `/mentors/{mentor}/media` | Public | Read mentor media metadata |
| GET | `/favorites` | Learner | List current user's favorites |
| POST / DELETE | `/favorites/{mentor}` | Learner | Add/remove favorite |
| GET | `/bookings` | Authenticated | List bookings for the current learner/mentor |
| POST | `/bookings` | Learner | Create booking and confirmation notification |
| PATCH | `/bookings/{booking}/cancel` | Owning learner | Cancel upcoming booking |
| GET / PUT | `/mentor/availability` | Mentor | Read/replace weekly availability |
| GET | `/mentor/requests` | Mentor | List pending requests |
| PATCH | `/mentor/requests/{booking}` | Owning mentor | Accept/decline request |
| GET | `/mentor/dashboard` | Mentor | Read upcoming count, earnings, and recent reviews |
| GET | `/notifications` | Authenticated | List current user's notifications |
| POST | `/notifications/read` | Authenticated | Mark current user's notifications read |

Search supports the marketplace fields used by the app, including query, category, rating, price bounds, sort, and page/per-page pagination. Laravel validation errors use HTTP 422 and an `errors` field; unauthenticated requests return 401, forbidden role/ownership requests return 403, and missing records return 404. Success data is wrapped in `data` (paginated responses also include `meta` and `links`).

## OpenAPI

The OpenAPI 3.1 endpoint, request, response, validation, and bearer-auth specification is [openapi.yaml](./openapi.yaml). Serve the file from a local OpenAPI viewer such as Swagger Editor, or import it into an OpenAPI-compatible client; no public hosted documentation service or extra backend route is required.

## Database tables

Domain tables: `users`, `mentor_profiles`, `bookings`, `mentor_availabilities`, `mentor_favorites`, `user_notifications`, `mentor_reviews`, and `mentor_media`. Sanctum adds `personal_access_tokens`. Laravel's standard cache and queue migrations create `cache`, `cache_locks`, `jobs`, `job_batches`, and `failed_jobs`.

## Tests and style

```sh
php artisan test
vendor/bin/pint --test
```

PHPUnit is configured for an isolated SQLite in-memory test database in `phpunit.xml`; tests do not connect to the `.env` MySQL database. Feature tests cover authentication, role checks, search and pagination, ownership boundaries, booking persistence/conflicts/rollback, availability, mentor decisions, private notifications, content, and dashboard aggregates.

The frontend test suite is run from the repository root with `npm test`; it mocks HTTP for client/component tests. `npm run test:integration` exercises a running, seeded local API over HTTP and only allows loopback hosts; set `API_INTEGRATION_BASE_URL` if Laravel runs on a different local port. `npm run typecheck` and `npm run lint` check frontend types and lint rules.
