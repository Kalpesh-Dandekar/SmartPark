# SmartPark API

Express + TypeScript API backed by Firebase Admin and Cloud Firestore.

## Setup

1. Copy `.env.example` to `.env` and provide a Firebase service-account project ID, client email, and private key. Never place these values in the frontend.
2. In Firebase Console, enable Email/Password Authentication and create a Firestore database.
3. Deploy `../database/firestore.rules` and `../database/firestore.indexes.json` with the Firebase CLI.
4. Run `npm run seed` once; it safely creates only missing slots P1–P6 as `AVAILABLE`.
5. Set an existing `users/{uid}.role` to `admin` manually for the first administrator. Public registration always creates `user` accounts.

## Commands

- `npm run dev` — development server
- `npm run lint` — lint backend source
- `npm run typecheck` — strict TypeScript check
- `npm test` — build and run reservation-time unit tests
- `npm run build` — compile to `dist/`
- `npm start` — run compiled API
- `npm run seed` — idempotently seed six parking slots

The API defaults to port 4000. Hardware integration, device telemetry, gate control, and physical QR scanning are intentionally not implemented.
