# Experience Connect

A React Native prototype of the learner and mentor journeys in the supplied wireframe. All sample profiles, availability, notifications, and bookings are local; the checkout is simulated and never processes a payment. Profile portraits are bundled vector illustrations, so the prototype works without network access.

## Run the app

```sh
npm install
npm start
```

Run `npm start` and use Expo Go to scan the QR code, or use an available Android emulator with `npm run android`. The iOS simulator requires macOS; for a browser preview, run `npm run web`.

## Checks

```sh
npm run typecheck
npx expo export --platform android
```

## Included journeys

- Welcome, sign in/sign up, and learner/mentor path selection
- Learner home, mentor search and filters, notifications, mentor profile, media, and reviews
- Local date/time selection, simulated payment, booking confirmation, and booking management
- Learner account, liked profiles, profile bookings, and profile notifications
- Mentor dashboard, weekly availability, consultation requests, earnings, and reviews
