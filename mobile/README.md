# owwdy mobile

Expo React Native client for the owwdy messenger.

## Status
This is the initial mobile shell. It is not yet connected to production authentication, the message API, push notifications, or end-to-end encryption. Do not treat the current UI as a secure messenger.

## Setup
1. Install Node.js LTS.
2. From this directory run `npm install`.
3. Replace `REPLACE_WITH_EXPO_PROJECT_ID` with the Expo project ID after creating/linking the Expo project.
4. Run `npx expo start`.

## Android APK
The `preview` EAS profile is configured to produce an installable APK. After the repository is connected to Expo EAS and credentials are configured, run an Android preview build. Production store releases should use the AAB profile.

## CI
GitHub Actions runs an Android JavaScript bundle export check for changes to this mobile client. This does not produce an APK or validate native device installation.

## Integration
The existing backend design must be imported and reviewed before wiring the client. Required contract includes authenticated per-device sessions, device-scoped delivery receipts, encrypted message envelopes, and Signal-compatible key management. Never store plaintext private keys in the database or commit secrets.
