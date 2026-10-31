# Kathaisolli (கதைசொல்லி)

**ஒவ்வொரு கதைக்கும் ஒரு குரல்** · *Every Story Has a Voice*

Kathaisolli is a Tamil-first audio-storytelling platform under incremental development. The current milestone includes a NestJS REST API, PostgreSQL/Prisma catalog and publishing workflow, Argon2id authentication, server-checked roles and creator ownership, private S3-compatible uploads, BullMQ processing with FFmpeg, and signed playback authorization. Web and native listener applications, creator-facing user interfaces, verified billing, and production deployment are not implemented.

## Requirements

- Node.js 22.18+ (verified with v24.11.0)
- pnpm 11 (verified with v11.25.0; `packageManager` is pinned to 11.25.0)
- Docker Desktop with Docker Compose (CLI verified: Docker 29.3.1, Compose 5.1.0; daemon availability is required to start services)

The API uses NestJS 11.2.8, Prisma 6.19.3, TypeScript 5.9.3, and argon2 0.45.1. The workspace uses pnpm and commits its generated `pnpm-lock.yaml`.

## Local API setup

1. Start Docker Desktop and wait for its Linux engine to be ready. Copy `.env.example` to `.env`, then replace `JWT_ACCESS_SECRET` with a random value of at least 32 characters. Keep `.env` local; it is ignored by Git.

   ```powershell
   Copy-Item .env.example .env
   ```

2. Start local PostgreSQL, Redis, and MinIO, then verify their health:

   ```powershell
   pnpm infra:up
   docker compose ps
   ```

   Compose maps PostgreSQL to `localhost:5432`, Redis to `localhost:6379`, and MinIO S3/API and console to `localhost:9000` and `localhost:9001`. Database is `kathaisolli`, user `kathaisolli`, password `kathaisolli_dev`. The local MinIO root credentials are `kathaisolli` / `change-this-local-development-secret`; these are development-only.

3. Install dependencies and generate the Prisma client:

   ```powershell
   pnpm install --frozen-lockfile
   pnpm db:generate
   ```

4. Validate the schema and apply the checked-in development migrations:

   ```powershell
   pnpm --filter @kathaisolli/api exec prisma validate --schema prisma\schema.prisma
   pnpm db:migrate
   ```

   `db:migrate` uses Prisma's development migration flow. If Prisma reports schema drift and offers to reset the database, stop and investigate; do not approve a reset of data you want to keep.

5. Start the API:

   ```powershell
   pnpm dev:api
   ```

The API listens on port `3000`. Its basic health/status endpoint is `GET http://localhost:3000/api/v1` and returns `{"name":"Kathaisolli API","status":"ok"}`. Development Swagger UI is at `http://localhost:3000/api/docs`. Because the API connects to PostgreSQL at startup, the status route is available only after the database connection succeeds.

### Quick API smoke test (PowerShell)

With the API running, check status, register a listener, verify the authenticated profile, and confirm public home discovery:

```powershell
Invoke-RestMethod http://localhost:3000/api/v1

$auth = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3000/api/v1/auth/register `
  -ContentType 'application/json' `
  -Body (@{
    email = 'listener@example.com'
    password = 'change-this-test-password'
    displayName = 'Test Listener'
  } | ConvertTo-Json)

Invoke-RestMethod `
  -Uri http://localhost:3000/api/v1/auth/me `
  -Headers @{ Authorization = "Bearer $($auth.accessToken)" }

Invoke-RestMethod http://localhost:3000/api/v1/home
```

Registration requires a password of at least 12 characters. To verify server-side role enforcement, call `GET /api/v1/admin/status` with the listener token; the expected result is `403 Forbidden`. Do not use production credentials for local testing.

Public catalog routes include `/api/v1/home`, `/api/v1/categories`, `/api/v1/languages`, `/api/v1/search`, paginated `/api/v1/series`, `/api/v1/series/:slug`, and `/api/v1/series/:slug/episodes`. Catalog series and episodes are filtered to published content with processed media; series/search accept `q`, `category`, `language`, `contentType`, and `premium` filters.

Creators can manage their own draft metadata at `/api/v1/creator/series`, `/api/v1/creator/series/:seriesId/seasons`, and `/api/v1/creator/episodes`, view their own series at `GET /api/v1/creator/series`, and submit a ready series at `POST /api/v1/creator/series/:seriesId/submit`. Admins and super-admins have corresponding metadata creation routes under `/api/v1/admin`, plus `POST /api/v1/admin/series/:seriesId/submit` and review routes `POST /api/v1/admin/series/:seriesId/review` and `/api/v1/admin/episodes/:episodeId/review`. Rejections require a moderation note. Server-side role and creator ownership checks apply.

The authenticated upload workflow is `POST /api/v1/uploads/initiate`, `POST /api/v1/uploads/:id/complete`, and `GET /api/v1/uploads/:id/status`. It issues a short-lived presigned form for a private bucket, validates upload metadata on completion, records the job, and queues FFmpeg/FFprobe processing through Redis/BullMQ. A successful processing job creates private HLS renditions, records media metadata, and moves the episode to `PENDING_REVIEW`; only moderation can publish it. `POST /api/v1/playback/authorize` returns a short-lived signed URL for published, processed audio; premium playback also requires a currently valid entitlement record.

The Tamil language and category seed data are development records. No story/episode audio is seeded. Keep the S3-compatible bucket private; use credentials with only the required bucket permissions.

MinIO's local console is at `http://localhost:9001`. Local compose credentials are for development only; change them before using any shared or deployed environment.

## Development-only accounts

Seed accounts are explicitly marked with `.local` email addresses and are refused when `NODE_ENV=production`. Before running `pnpm db:seed`, set three different `SEED_DEMO_LISTENER_PASSWORD`, `SEED_DEMO_CREATOR_PASSWORD`, and `SEED_DEMO_ADMIN_PASSWORD` values in `.env`, each at least 16 characters long. They are hashed with Argon2id. Never reuse a real account password. Seed data includes users only; catalog content is not yet available.

## Audio runtime configuration

The API and worker require `DATABASE_URL`, `REDIS_URL`, and `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and `S3_FORCE_PATH_STYLE`. `S3_UPLOAD_URL_TTL_SECONDS` (default 300, maximum 600) controls upload-form lifetime; `MAX_AUDIO_UPLOAD_BYTES` (default 524288000) caps upload size. Set `FFPROBE_PATH` and `FFMPEG_PATH` to installed executable paths when they are not on `PATH`. The example `.env` values are local-only. Configure bucket CORS to permit the intended web origin to POST the presigned form; do not make the bucket public.

Run the API and processing worker in separate PowerShell terminals:

```powershell
pnpm dev:api
pnpm --filter @kathaisolli/api start:worker
```

The worker retries processing jobs with exponential backoff. FFmpeg and S3/MinIO must be reachable at runtime; without those services, processing is unavailable and is reported as a failed job rather than successful media.

## Tests and verification

```powershell
pnpm --filter @kathaisolli/api exec prisma validate --schema prisma\schema.prisma
pnpm db:generate
pnpm build:api
pnpm test:api
pnpm --filter @kathaisolli/api test:e2e
```

**Verified on 2026-10-30:** Docker Desktop Linux engine on WSL 2 was launched and confirmed healthy. Docker Compose infrastructure (`postgres`, `redis`, `minio`) was brought up and all three services reached healthy state. Prisma database migrations were applied cleanly (4 migrations applied), schema is up-to-date, and demo seed completed with 3 demo accounts (listener, creator, admin) and 12 Tamil categories. The NestJS API (`pnpm dev:api`) and background worker (`pnpm --filter @kathaisolli/api start:worker`) were verified running with Redis and PostgreSQL. API smoke tests (health check, listener registration, login, auth profile, catalog endpoints, RBAC admin endpoints, 401 unauthorized, and 403 forbidden rejections) all passed. MinIO object storage verification (bucket initialization, upload, retrieval, signed URL generation, file type validation, size validation, and unauthorized upload rejection) passed. Build passed (`pnpm build:api`), unit test suite passed (9 suites / 26 tests), and API E2E passed (1 suite / 1 test).

## Roadmap and limitations

- Implemented server milestone: authentication, catalog discovery, role-checked content creation, series/episode moderation, private upload authorization, BullMQ/FFmpeg processing, and signed playback authorization.
- Next: creator editing and profile-approval administration, signed HLS manifest/segment delivery, payment-provider verification, transactional queue/outbox reliability, and end-to-end media tests.
- Later: responsive listener web app, real native Android/iOS apps with background audio and authorized offline downloads, synchronized playback, analytics, CI, and production deployment.

Premium access currently trusts active entitlement rows in the database; no billing or purchase-verification endpoint grants them. Playback currently signs the processed source object rather than serving HLS through an authorized manifest/segment path. No listener clients, audio content, payment provider, production secrets, or release builds are present. No legal compliance determination is implied; privacy, copyright, consumer/subscription, and children's privacy requirements need qualified review before launch.

For this verification, Node v24.11.0, pnpm v11.25.0, npm v11.6.1, Docker CLI 29.3.1, and Docker Compose 5.1.0 were observed. Dependency setup initially found the nonexistent `@types/supertest@7.0.0` pin; it was corrected to published `7.2.1`, and the lockfile was generated and installed successfully. Native install scripts were explicitly enabled only for Prisma, Argon2, and esbuild in `pnpm-workspace.yaml`.

See [implementation status](./docs/implementation-status.md) for completed work, blocked validation, and remaining phases.
# Kathaisolli-
