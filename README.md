# Experience Connect

Experience Connect is an Expo/React Native app for learners and mentors, backed by a Laravel REST API and MySQL. The app keeps its existing custom navigation and UI while loading mentors, bookings, favorites, availability, notifications, and mentor operations from the backend.

## Prerequisites

- Node.js compatible with Expo SDK 57 and npm
- PHP 8.3+, Composer 2.8+, and MySQL 8+
- A device or emulator running Expo Go (native secure token storage requires a native build; web uses browser local storage)

## Run locally

1. Install frontend dependencies:

   ```sh
   npm install
   ```

2. Set up the backend by following [experience-connect-rest-apis/README.md](./experience-connect-rest-apis/README.md). Start Laravel on `0.0.0.0:8000` so devices on the local network can reach it.

3. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`:

   ```dotenv
   # Android emulator
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api
   ```

   For iOS simulator or web, use `http://127.0.0.1:8000/api`. For a physical device, use the development computer's LAN IP (for example `http://192.168.1.10:8000/api`) and allow local network access through its firewall. Do not use `localhost` for a physical device. `.env` files are ignored by git.

4. Start Expo:

   ```sh
   npm start
   ```

   Use Expo Go, or run `npm run android`, `npm run ios` (macOS), or `npm run web`.

To exercise the live backend separately from mocked component tests, start Laravel after seeding its development fixtures, then run `npm run test:integration` from the repository root. The script only permits a loopback API host. Override `API_INTEGRATION_BASE_URL`, `API_INTEGRATION_EMAIL`, or `API_INTEGRATION_PASSWORD` when using a different local port or fixture account.

Development fixture accounts after running the backend seeder:

| Role | Email | Password |
|---|---|---|
| Learner | `learner@example.com` | `demo12345` |
| Mentor | `rahul.sharma@example.com` | `demo12345` |

These credentials are for local development only. See the backend README for test data setup, API/auth details, endpoints, and the OpenAPI document.

## Implemented journeys

- Learner registration/login, role selection, profile, mentor search and filters, favorites, booking creation/cancellation, and notifications.
- Mentor dashboard, weekly availability and time slots, pending requests and decisions, earnings, and reviews.
- Secure token persistence on native platforms; browser local storage on web.
- Demo checkout still creates a booking without charging a payment method. Social login and password recovery are not faked as successful flows. The current UI does not upload mentor media.

## Checks

```sh
npm test
npm run test:integration
npm run typecheck
npm run lint
npx expo export --platform android
```

Backend checks (run from `experience-connect-rest-apis`):

```sh
php artisan test
vendor/bin/pint --test
```

Backend feature tests use an isolated in-memory SQLite database and never migrate or seed the configured MySQL development database.

## Test-case matrix

| Feature | Expected result | Automated coverage |
|---|---|---|
| Registration, login, token restore/logout, protected profile | Valid credentials establish a session; invalid data is rejected; logout revokes token | Backend `AuthenticationTest`; frontend API and app journey tests; local API integration test |
| Mentor discovery | Search, filters, sorting, and pagination return matching published profiles | Backend `MarketplaceAndBookingTest` |
| Favorites and ownership | Learners can save/remove mentors; mentor-role access is rejected | Backend `MarketplaceAndBookingTest` |
| Booking lifecycle | Valid bookings persist with a notification; conflicts, invalid roles, and other-user cancellation are rejected; transaction rolls back on notification failure | Backend `MarketplaceAndBookingTest` |
| Mentor operations | Availability, request decisions, private notifications, reviews/media, and dashboard aggregates are returned for the authenticated mentor | Backend `MentorOperationsTest` |
| API/client errors and learner UI | Network/server/validation errors are surfaced; registration-to-booking updates the UI; saved session can be revoked | Frontend `api.test.ts` and `App.journey.test.tsx` |

## Known limitations

- No payment provider, social authentication, password-reset service, or mentor-media file upload is connected because the current screens do not provide their required complete workflows.
- The Expo component journey mocks HTTP at the client boundary; Laravel feature tests exercise API routes in-process and `npm run test:integration` exercises a running local API. No device-driven E2E runner is configured.
- Set a real MySQL database/user and the device-specific API URL locally before trying live app/API communication.
