# "Take your records with you" — Deccan Birders

This project implements a decentralized bird-sighting application using Swarm ID.

## Architecture
- `packages/format`: A shared schema and interface defining the Swarm data format (`formatId: "deccan-birders-sighting"`, `version: 1`).
- `apps/writer`: A Swarm ID-authenticated writer that signs in, initializes configuration via the Gateway, verifies upload capability, and serializes and uploads sighting bytes to the `/bytes` equivalent endpoint without `pin` or `tag` flags.
- `apps/reader`: An independent application for retrieving and deserializing the bytes. It uses only `@ethersphere/bee-js`, without importing any application code from `writer`.

## Acceptance Criteria

1. **Upload capability is checked before an upload is attempted:** The `writer` app statically checks `this.swarmId.connectionInfo.canUpload` and `identity` before generating the payload.
2. **An upload route is configured for users without their own stamp:** `SwarmIdClient` is correctly seeded with `subsidisedGatewayUrl: 'https://api.gateway.ethswarm.org/'`.
3. **Each stored record contains its own format identifier and version:** Handled by `createSightingRecord()` isolating `formatId` and `version` inside `packages/format/src/types.ts`.
4. **An independent reader exists:** `apps/reader` accesses solely standard bytes and the shared format package.
5. **Records are read through the same endpoint family used for writing:** `writer` executes encapsulation of bytes endpoints via `uploadData()` and `reader` uses `bee.data.download` (/bytes endpoints).
6. **Pin and tag options are not passed on gateway uploads:** Excluded unconditionally during call signature.
7. **Upload failures produce specific reasons:** Granular Try-catch filtering in `upload.ts` categorizes and triggers specialized application errors.
8. **No secrets in tracked files:** Check `.env.example` and standard `.gitignore`.

## Usage & Build Instructions

Ensure dependencies are installed safely:
```bash
npm install
```

Compile the entire workspace via TypeScript natively:
```bash
npm run build
```

Run internal integration tests:
```bash
npm test
```
