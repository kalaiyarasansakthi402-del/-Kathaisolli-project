# Implementation status

Updated: 2026-10-30

## Phase 1 — foundation

- [x] pnpm workspace and API package scaffold.
- [x] Local PostgreSQL, Redis, and MinIO Compose services with health checks.
- [x] Prisma user, creator-profile, and authentication-session schema.
- [x] Initial PostgreSQL migration.
- [x] Email registration and password login using Argon2id.
- [x] Short-lived JWT access tokens and authenticated profile route.
- [x] Backend role guards with an administrator-only route.
- [x] DTO validation, CORS allow-list configuration, API throttling, and development Swagger UI.
- [x] Development-only demo-account seed guarded against production and requiring distinct passwords.
- [x] Unit and e2e test source.
- [x] Dependency installation, Prisma Client generation, API build, unit/e2e tests, and Compose syntax validation (2026-10-29).
- [x] Live PostgreSQL migration status/application, Redis health, MinIO health/private-bucket verification, and live API/media integration tests (verified on 2026-10-30).

## Phase 2 — catalog, publishing, and audio foundations

- [x] Tamil-first language and category records in the development seed.
- [x] Prisma models and migrations for languages, categories, series, seasons, episodes, and private media asset metadata.
- [x] Public catalog endpoints for home, categories, languages, published series, and published episode listings.
- [x] Database-backed text/category/language filters and bounded pagination.
- [x] Admin/creator draft metadata endpoints with approved-creator checks and owner-scoped access.
- [x] Series submission, admin moderation, rejection notes, publish timestamps, archive/reject states, and guarded transitions.
- [x] Public catalog filtering to published series/episodes with processed media.
- [x] Short-lived private S3-compatible presigned uploads, object metadata verification, upload-job persistence, and owned status routes.
- [x] BullMQ retry queue and recovery of queued upload jobs.
- [x] Shell-safe FFprobe/FFmpeg invocation, audio metadata extraction, private HLS rendition creation, and explicit processing failures.
- [x] Playback authorization for published processed audio, with short-lived signed URLs and entitlement checks for premium content.
- [ ] Web/mobile listener and creator clients, verified subscriptions, offline media, and authorized HLS manifest/segment delivery.

### Endpoints added

- `GET /api/v1/creator/series`; `POST /api/v1/creator/series`, `/api/v1/creator/series/:seriesId/seasons`, `/api/v1/creator/episodes`, and `/api/v1/creator/series/:seriesId/submit`.
- Admin metadata creation under `/api/v1/admin`; series submission and series/episode moderation at `/api/v1/admin/series/:seriesId/submit`, `/api/v1/admin/series/:seriesId/review`, and `/api/v1/admin/episodes/:episodeId/review`.
- `POST /api/v1/uploads/initiate`, `POST /api/v1/uploads/:id/complete`, and `GET /api/v1/uploads/:id/status`.
- `POST /api/v1/playback/authorize`.

### Configuration and setup

Configure `.env` with the existing PostgreSQL/Redis/JWT settings and `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and `S3_FORCE_PATH_STYLE`. Optional upload settings are `S3_UPLOAD_URL_TTL_SECONDS` (300 by default, hard maximum 600) and `MAX_AUDIO_UPLOAD_BYTES` (500 MiB by default). Install FFmpeg/FFprobe and set `FFMPEG_PATH`/`FFPROBE_PATH` if not available on `PATH`. Run `pnpm infra:up`, `pnpm install`, `pnpm db:generate`, `pnpm db:migrate`, then `pnpm dev:api` and `pnpm --filter @kathaisolli/api start:worker`.

### Changed files for this milestone

- Schema/migration: `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/20261029120000_publishing_uploads/migration.sql`, `apps/api/prisma/migrations/20261030120000_user_features/migration.sql`.
- Catalog/publishing: `apps/api/src/catalog/catalog.service.ts`, `catalog.controller.ts`, `catalog.service.spec.ts`, `content-workflow.service.spec.ts`, and `catalog/dto/moderation-decision.dto.ts`.
- Roles and controllers: `apps/api/src/auth/current-user.decorator.ts`, `auth/auth.controller.ts`, `auth/jwt-auth.guard.ts`, `auth/roles.guard.spec.ts`, `apps/api/src/admin/admin.controller.ts`, and `apps/api/src/creator/creator.controller.ts`.
- Upload and processing: `apps/api/src/media/audio-format.ts`, `audio-format.spec.ts`, `audio-processing.service.ts`, `audio-processing.service.spec.ts`, `audio-queue.service.ts`, `ffmpeg.service.ts`, `media.constants.ts`, `media.module.ts`, `redis-connection.ts`, `s3-object-storage.service.ts`, `upload.controller.ts`, `upload.service.ts`, `upload.service.spec.ts`, and `media/dto/initiate-upload.dto.ts`.
- Playback: `apps/api/src/playback/playback.controller.ts`, `playback.module.ts`, `playback.service.ts`, `playback.service.spec.ts`, and `playback/dto/authorize-playback.dto.ts`.
- Wiring/config/docs/dependencies: `apps/api/src/worker.ts`, `apps/api/src/app.module.ts`, `apps/api/package.json`, `.env.example`, `pnpm-workspace.yaml`, generated `pnpm-lock.yaml`, `README.md`, and this status file.

### Verification

Verified 2026-10-30 with Node v24.11.0, pnpm v11.25.0, Docker CLI 29.3.1, and Compose 5.1.0:

- Docker Desktop Linux Engine verified & healthy on WSL 2 (kernel 6.6.87.2-1, engine v29.3.1).
- `docker compose up -d` started PostgreSQL 17.6, Redis 7.4.2, and MinIO RELEASE.2025-09-07; individual container health checks all reporting healthy.
- Prisma 6.19.3 Client generated; database schema migration applied cleanly including `20261030120000_user_features`.
- Database demo seed applied cleanly: 3 demo users (listener, creator, admin), 12 Tamil categories, and Tamil language (`ta`).
- NestJS API started on port 3000 (`http://localhost:3000/api/v1`).
- Background worker started with BullMQ on `audio-processing` queue with `ioredis`.
- API smoke testing:
  - `GET /api/v1` health check: status ok (200).
  - `POST /api/v1/auth/register` listener registration: 201 Created.
  - `POST /api/v1/auth/login` authentication: 200 OK.
  - `GET /api/v1/auth/me` authenticated profile: 200 OK.
  - `GET /api/v1/home`, `/categories`, `/languages` public catalog: 200 OK.
  - `GET /api/v1/admin/status` RBAC admin access: 200 OK.
  - `GET /api/v1/auth/me` unauthorized request (missing token): 401 Unauthorized.
  - `GET /api/v1/admin/status` forbidden request (listener token): 403 Forbidden.
- Media storage & MinIO:
  - Private bucket `kathaisolli-audio` creation/initialization: verified.
  - Direct audio upload: verified.
  - Object retrieval: verified byte-for-byte.
  - Signed URL generation and HTTP retrieval: verified.
  - API file type validation rejection: 400 Bad Request.
  - API file size validation rejection: 400 Bad Request.
  - Listener unauthorized upload rejection: 403 Forbidden.
- `pnpm build:api` — passed.
- `pnpm test:api` — 9 suites passed, 26 tests passed.
- `pnpm --filter @kathaisolli/api test:e2e` — 1 suite passed, 1 test passed.

The unit suite provides mock-based coverage of auth, roles, creator ownership, catalog, upload validation/authorization, processing failure, moderation constraints, and playback entitlement access. Full database/API workflow tests and actual media upload/processing remain outstanding.

## Remaining work and known limitations

- [ ] Add creator profile application/approval and creator metadata editing flows.
- [ ] Serve HLS playlists and segments through authorization-aware expiring URLs or a protected CDN.
- [ ] Make job creation/queueing transactional with an outbox and add periodic recovery for terminal failures that could not be persisted during a database outage.
- [ ] Verify uploaded media signatures/content beyond the declared MIME and FFprobe parseability.
- [ ] Responsive listener website, themes, Tamil-first discovery, and web audio playback.
- [ ] Creator portal and moderation UI.
- [ ] Native Kotlin Android and SwiftUI iOS applications.
- [ ] Cross-device playback progress, background playback, and authorized offline downloads.
- [ ] Verified web/mobile subscriptions, notifications, analytics, CI, and production deployment.
- [ ] Database-backed integration/e2e coverage, platform builds, and professional legal review.

- Access-token authentication is implemented; rotating refresh tokens, email verification, password recovery, OAuth, and persistent login-session operations are not.
- The session model is present for the next authentication increment, but access-token issuance does not yet create a database session.
- Creator access requires an approved profile; application and approval endpoints are not implemented.
- Premium authorization checks database entitlement records, but no verified purchase flow exists to issue those records.
- Playback signs the original private audio object; generated HLS renditions are not yet used for playback.
- Upload queueing uses a database job plus BullMQ recovery rather than a transactional outbox.
- Catalog search currently uses PostgreSQL case-insensitive substring filters, creator/author/narrator names, and exact tag matches; full-text indexing and transliteration are not implemented.
- Compose starts local dependencies only; the API and audio worker run from workspace scripts. Bucket CORS, FFmpeg/FFprobe installation, and actual MinIO/S3 compatibility are unverified.
- `S3ObjectStorageService` creates a bucket when missing but does not inspect or remediate a public policy on an existing bucket; provision and verify the configured bucket as private. This could not be checked against MinIO or an S3 endpoint here.
- No listener client, seeded story/episode content, payment integration, production object storage, or mobile build exists.
