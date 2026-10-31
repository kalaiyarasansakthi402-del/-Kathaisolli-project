# Kathaisolli (கதைசொல்லி) — Project Audit

Date: 2026-10-30  
Repository Root: `E:\Kathaisolli`  
Tagline: ஒவ்வொரு கதைக்கும் ஒரு குரல் — *Every Story Has a Voice*

---

## 1. Executive Summary

Kathaisolli is a Tamil-first audio storytelling platform inspired by Kuku FM, designed with completely original branding, Tamil typography, and 100% free access for all listeners. The platform eliminates all paywalls, payment gateways, subscriptions, and premium restrictions.

This audit assesses the current codebase state, identifying functional assets, architectural strengths, gaps to be filled, and obsolete payment/subscription references that must be purged according to the master specification.

---

## 2. Repository Structure & Configuration

- **Workspace Engine**: `pnpm@11.25.0`, Node.js `v24.11.0`, TypeScript `5.9.3`.
- **Monorepo Configuration (`pnpm-workspace.yaml`)**:
  - `apps/*`
  - `packages/*`
  - Pinned build permissions for `@prisma/client`, `@prisma/engines`, `argon2`, `esbuild`, `prisma`.
- **Infrastructure (`docker-compose.yml`)**:
  - PostgreSQL 17.6 Alpine (port 5432)
  - Redis 7.4.2 Alpine (port 6379)
  - MinIO S3 Object Storage (ports 9000 & 9001)
  - Environment variables defined in `.env.example` and configured in `.env`.

---

## 3. Backend Audit (`apps/api`)

### 3.1 Architecture & Stack
- **Framework**: NestJS 11.2.8 with Express platform.
- **ORM**: Prisma ORM 6.19.3.
- **Authentication**: Argon2id password hashing + JWT access tokens (`JwtAuthGuard`, `RolesGuard`).
- **Media Ingestion & Processing**:
  - Direct private presigned uploads to S3/MinIO via `@aws-sdk/s3-presigned-post`.
  - Background audio worker powered by `BullMQ` + `Redis`.
  - HLS audio segmentation, transcoding, and FFprobe metadata extraction (`ffmpeg.service.ts`).
  - Playback authorization via signed S3 object URLs (`playback.service.ts`).

### 3.2 Existing Modules
1. **AppModule**: Global config, throttler, Prisma, Auth, Catalog, Media, Playback.
2. **AuthModule**: Registration, login, `/auth/me` profile route, role guards (`LISTENER`, `CREATOR`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`).
3. **CatalogModule**: Public catalog browsing, series/season/episode hierarchies, category/language taxonomy, creator/admin draft authoring and moderation transitions.
4. **MediaModule**: Audio upload initiation, completion webhook/callback, queueing, transcoding, storage service.
5. **PlaybackModule**: Audio playback authorization and URL signing.

### 3.3 Test Suite Status
- Unit tests: 9 test suites, 26 tests passing (`pnpm test:api`).
- Build status: `pnpm build:api` compiles cleanly without warnings.

---

## 4. Key Gaps & Required Enhancements

### 4.1 Strict 100% Free Model Enforcement
- **Obsolete Components**:
  - `SubscriptionEntitlement` model in Prisma schema.
  - `premiumFlag` on `Series` and `Episode`.
  - Entitlement verification inside `PlaybackService.authorizePlayback()`.
- **Action Plan**:
  - Ensure all published episodes are universally free.
  - Safely remove/bypass subscription entitlement logic.
  - Maintain backwards database compatibility without destructive resets.

### 4.2 Missing Backend Capabilities
- **User Engagement**:
  - Favorites & Bookmark system (`POST /api/v1/library/favorites`).
  - Listening History & Playback Progress synchronization (`PUT /api/v1/library/progress`, `GET /api/v1/library/history`).
  - User Playlists (`GET/POST/PUT/DELETE /api/v1/playlists`).
  - User Profile editing, avatar upload, and account deletion.
- **Creator Studio**:
  - Creator verification request & approval flow.
  - Creator analytics (plays, listening duration, completion rates).
- **Admin Dashboard**:
  - Complete dashboard KPIs (total users, active listeners, creators, stories, audio hours, moderation counts).
  - Moderation workflow with audit notes, approval, rejection, and publishing triggers.
  - User suspension & reactivation.
- **Notifications**:
  - In-app notification center (story updates, approvals, announcements).
- **AI Story Assistant**:
  - Content ideation, title/description generator, Tamil grammar assistance, and summarization.

### 4.3 Missing Frontend Applications
1. `apps/web`: Responsive React 19/18 + Vite + Tailwind CSS listener website (25 comprehensive pages).
2. `apps/mobile`: React Native Expo application for Android and iOS with background audio, lockscreen controls, and offline listening.
3. `apps/admin`: Super Admin Panel and Creator Studio dashboard.

### 4.4 Missing Shared Packages
1. `packages/shared-types`: Unified TypeScript definitions across backend and frontends.
2. `packages/design-tokens`: Kathaisolli branding palette (Forest Green `#064E3B`, Mint Green `#A7F3D0`, Deep Green `#022C22`, etc.), typography, and spacing.
3. `packages/validation`: Client and server shared validation schemas.
4. `packages/api-client`: Fully typed API client with interceptors and offline resilience.
5. `packages/shared-utils`: Duration formatters, Tamil date helpers, and slug utilities.

---

## 5. Audit Conclusion

The backend foundation is well-structured and solid. The next immediate step is to document the comprehensive implementation plan, establish the shared packages, purge all subscription/payment relics to honor the 100% free mandate, expand the API, and build the Web, Mobile, and Admin client applications.
