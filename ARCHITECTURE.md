# owwdy — Architecture

> Status: architecture baseline. This document describes the intended MVP and security invariants; it does not claim that the modules below are implemented yet.

## Product scope

A private, end-to-end encrypted messenger. The server routes ciphertext and delivery metadata; it must never receive message plaintext or private identity/session keys.

MVP capabilities:
- Account registration and login, with multiple registered devices.
- Chat list and private one-to-one chats.
- Encrypted message send, delivery and read receipts.
- Per-device offline delivery and synchronization.
- Message expiration (TTL).
- Presence and reconnect support.

## Technology

- Web client: React + TypeScript.
- API/realtime: Node.js + TypeScript, HTTP API and WebSocket.
- Persistence: PostgreSQL.
- Ephemeral presence, rate limits and cross-instance fan-out: Redis.
- Local development: Docker Compose.
- E2E cryptography: official Signal libsignal implementation, subject to confirming the supported runtime/build target before integration.
- Client cryptographic state: IndexedDB, protected at rest with a WebCrypto wrapping-key design; plaintext key material must not be persisted unprotected.

## Module map

| Module | Responsibility | Status |
|---|---|---|
| 01 | Project foundation, configuration, health endpoint, Docker Compose | Planned |
| 02 | Authentication, devices, refresh tokens, authenticated WebSockets | Planned |
| 03 | Chats, membership checks, idempotent direct-chat creation, presence | Planned |
| 04 | Messages, per-device envelopes, receipts, offline queue, TTL | Planned |
| 05 | Signal identity keys, signed prekeys, one-time prekeys, session management | Planned |
| 06 | Client integration, synchronization/reconnect hardening and E2E tests | Planned |

## Message and envelope flow

1. The sender client encrypts independently for each recipient device using its established Signal session.
2. The API stores one ciphertext envelope per target device in message_envelopes.
3. WebSocket fan-out sends only the envelope addressed to the socket's device ID.
4. Offline sync returns only envelopes whose recipient_device_id matches the authenticated requesting device.
5. The recipient client decrypts locally. The server never receives plaintext.

### WebSocket event envelope

Events use a versioned JSON envelope:

    {"v":1,"type":"message:new","eventId":"uuid","chatId":"uuid","messageId":"uuid","recipientDeviceId":"uuid","sentAt":"2026-01-01T00:00:00.000Z","ciphertext":"base64"}

The event's recipientDeviceId must match the authenticated device on the receiving socket. Never broadcast a device-specific ciphertext to every socket belonging to the user.

## Security invariants

- Server never sees plaintext messages, identity private keys, signed-prekey private keys, one-time-prekey private keys, or ratchet state.
- Every WebSocket connection is authenticated and bound to a device ID.
- Device-specific envelopes are delivered only to that device.
- Pending sync is scoped to the authenticated device and joins message_envelopes by recipient_device_id.
- Identity public keys are immutable for a device. A changed key must return 409 IDENTITY_KEY_CHANGED; never silently overwrite it.
- Key bundle retrieval atomically consumes at most one one-time prekey.
- Envelope writes are idempotent and unique per message/recipient device.
- HTTP key and envelope endpoints require the actual authentication middleware.
- Secrets are loaded from environment variables; only placeholders belong in .env.example.

## Data model direction

Core tables: users, devices, refresh_tokens, chats, chat_members, messages, message_envelopes, message_receipts, identity_keys, prekeys.

Device-level delivery receipts should be represented per device. Read state should define a clear user-level aggregation across a user's active devices. TTL expiry must clean up messages, envelopes and receipts consistently and publish a message:expired event.

## Required correctness fixes

1. WebSocket registry maps each socket to its device ID; device-targeted sends select only sockets for that device.
2. Pending sync returns metadata plus the requesting device's envelope; it must not depend on a non-null legacy messages.ciphertext.
3. Identity-key upsert must not overwrite a changed key; return 409 IDENTITY_KEY_CHANGED.
4. Redis rate limiting increments and refreshes the 60-second expiry on every request.
5. The envelopes router must apply authentication middleware.
6. Key lookup reports prekeysLow: true when fewer than 10 one-time prekeys remain.
7. Envelope persistence uses a batched insert and fan-out deduplicates active devices.

Additional requirements:
- Exclude the sending device from its own outgoing fan-out, but include the sender's other registered devices where the product requires multi-device sync.
- Use Redis Pub/Sub for cross-instance device fan-out in multi-server deployments.
- TTL cleanup cascades to envelopes and receipts.
- A ciphertext-set hash is computed from a canonical sorted representation of the device IDs and ciphertext bytes, not from one arbitrary envelope.
- Message creation and envelope insertion must be atomic.
- Test two devices end-to-end: registration, bundle retrieval, send, delivery, read, offline sync and reconnect.

## Local verification gates

Run in order:
1. pm run typecheck
2. docker compose up -d
3. pm run dev
4. Verify /health returns a healthy response.
5. Run unit/integration tests, then npm run test:e2e.

Do not mark a gate complete without its actual command output. Do not start Module 06 until Modules 01–05 pass their verification gates.
