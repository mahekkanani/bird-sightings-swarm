# "Take your records with you" — Deccan Birders

This project implements a decentralized bird-sighting application using Swarm ID.

## Architecture
- `packages/format`: A shared schema and interface defining the Swarm data format (`formatId: "deccan-birders-sighting"`, `version: 1`).
- `apps/writer`: A Swarm ID-authenticated writer that signs in, fetches subsidized postage via the Gateway, verifies upload capability, and serializes and uploads sighting bytes to the `/bytes` endpoint without `pin` or `tag` flags.
- `apps/reader`: An independent application for retrieving and deserializing the bytes. It uses only `@ethersphere/bee-js`, without importing any application code from `writer`.

## Acceptance Criteria

1. **Upload capability is checked before an upload is attempted:** The `writer` app checks `SwarmIdClient.getConnectionInfo().uploadCapability` before constructing the payload.
2. **An upload route is configured for users without their own stamp:** `SwarmIdClient` is configured with `subsidisedGatewayUrl: 'https://api.gateway.ethswarm.org/'`.
3. **Each stored record contains its own format identifier and version:** Handled by `createSightingRecord()` in `packages/format/src/types.ts`.
4. **An independent reader exists:** `apps/reader` accesses only standard bytes and the format definitions.
5. **Records are read through the same endpoint family used for writing:** `writer` uses `uploadData` (/bytes endpoint) and `reader` uses `downloadData` (/bytes endpoint).
6. **Pin and tag options are not passed on gateway uploads:** Built-in without passing specific headers.
7. **Upload failures produce specific reasons:** Try-catch logic inside `upload.ts` categorizes and throws specialized errors.
8. **No secrets in tracked files:** Check `.env.example` and standard `.gitignore`.

## Usage
*Not yet fully configured with valid NPM package names due to NPM registry checking limits. Structure strictly prepared.*
