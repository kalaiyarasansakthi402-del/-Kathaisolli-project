# Kathaisolli (கதைசொல்லி) — Production Deployment Guide

This guide provides end-to-end instructions for deploying Kathaisolli across its production infrastructure:

- **Web Frontend (`apps/web`)**: Hosted on **Vercel**
- **Admin Dashboard (`apps/admin`)**: Hosted on **Vercel**
- **Backend API (`apps/api`)**: Hosted on **Render** (Node.js runtime)
- **Database**: Managed **PostgreSQL** (Neon, Supabase, or Render PostgreSQL)
- **Cache & Task Queue**: **Redis** (Upstash Redis or Render Redis)
- **Audio & Media Storage**: **Firebase Storage** (Google Cloud Storage)

---

## Architecture & Production URLs Summary

| Service | Hosting | Directory | Build Command | Output / Start | Health Check / Routing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **API Backend** | Render | Root (`.`) | `corepack pnpm install --frozen-lockfile && corepack pnpm --filter @kathaisolli/api build` | `node apps/api/dist/main.js` | `GET /api/v1/health` |
| **Web App** | Vercel | `apps/web` | `pnpm run build` | `dist` | SPA Rewrites to `/index.html` |
| **Admin App** | Vercel | `apps/admin` | `pnpm run build` | `dist` | SPA Rewrites to `/index.html` |
| **Database** | Managed Postgres | Remote | N/A | Port 5432 / 6543 | Prisma Schema Migrations |
| **Redis Cache** | Upstash / Render | Remote | N/A | Port 6379 | `rediss://` / `redis://` |

---

## 1. Prerequisites & Preparation

1. **Node.js**: `>= 22.18.0`
2. **Package Manager**: `pnpm >= 9.15.4` (`corepack enable pnpm`)
3. Accounts on:
   - [GitHub](https://github.com) (Repository hosting)
   - [Render](https://dashboard.render.com) (Web service hosting)
   - [Vercel](https://vercel.com) (Frontend static + SPA hosting)
   - [Firebase Console](https://console.firebase.google.com) (Storage bucket)
   - [Neon](https://neon.tech) / [Supabase](https://supabase.com) / Render Postgres (Database)
   - [Upstash](https://upstash.com) or Render Redis (Cache & BullMQ)

---

## 2. Environment Variables Specification

### A. Backend API (Render Dashboard -> Environment Variables)

| Variable | Description | Example / Required Format |
| :--- | :--- | :--- |
| `NODE_ENV` | Production environment flag | `production` |
| `PORT` | Listening port (Render sets this automatically to 10000) | `10000` |
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgresql://user:password@host:5432/dbname?sslmode=require` |
| `REDIS_URL` | Redis URI (`redis://` or `rediss://` for TLS) | `rediss://default:token@host:6379` |
| `JWT_ACCESS_SECRET` | Secret key for access token encryption (>= 32 chars) | Random 48-64 char alphanumeric string |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens (>= 32 chars) | Random 48-64 char alphanumeric string |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `https://your-web.vercel.app,https://your-admin.vercel.app` |
| `INITIAL_ADMIN_EMAIL` | Optional initial admin email for first seed | `admin@kathaisolli.com` |
| `INITIAL_ADMIN_PASSWORD` | Optional initial admin password (>= 16 chars) | `SecureAdminPassword123!` |
| `INITIAL_ADMIN_NAME` | Optional initial admin display name | `Kathaisolli Admin` |

> [!IMPORTANT]
> The NestJS API automatically allows any origin ending with `.vercel.app` in addition to whatever is set in `CORS_ORIGINS`.

---

### B. User Website (Vercel Project 1: `apps/web`)

| Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public production URL of the Render API | `https://kathaisolli-api.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | From Firebase Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `vaagai-audio-books-36a4e.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `vaagai-audio-books-36a4e` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket | `vaagai-audio-books-36a4e.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | Firebase project sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | Firebase web app ID |
| `VITE_FIREBASE_STORIES_PATH` | Stories folder prefix | `stories` |

---

### C. Admin Website (Vercel Project 2: `apps/admin`)

| Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public production URL of the Render API | `https://kathaisolli-api.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | From Firebase Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `vaagai-audio-books-36a4e.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `vaagai-audio-books-36a4e` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket | `vaagai-audio-books-36a4e.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | Firebase project sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | Firebase web app ID |

---

## 3. Database Deployment & Migrations

### Safe Migration Deployment

The database schema is managed via Prisma with 4 incremental migrations:
- `20261029110000_init`
- `20261029113000_catalog`
- `20261029120000_publishing_uploads`
- `20261030120000_user_features`

1. **Do NOT run `prisma migrate dev` or `prisma migrate reset` in production.**
2. In production, run the idempotent deploy command:
   ```bash
   pnpm db:deploy
   ```
   *(which maps directly to `prisma migrate deploy`)*.
3. This applies all pending migrations safely without modifying or deleting existing records.

### Safe Reference Data Seeding

After migrations are deployed, seed the essential reference categories and Tamil language record:
```bash
pnpm db:seed
```
- In production (`NODE_ENV=production`), the seed script uses `upsert` and will not duplicate or overwrite categories.
- It safely skips creating demo users in production.

---

## 4. Backend Deployment on Render

### Method A: Blueprint Deployment (render.yaml)
The repository contains a pre-configured `render.yaml` blueprint.
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect `https://github.com/kalaiyarasansakthi402-del/-Kathaisolli-project.git`.
4. Render detects `render.yaml` and prepares the `kathaisolli-api` service.
5. Provide the secret environment variables (`DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
6. Click **Apply**.

### Method B: Manual Web Service Setup
1. Click **New +** -> **Web Service**.
2. Select your repository.
3. Set the following settings:
   - **Name**: `kathaisolli-api`
   - **Region**: Oregon (or closest to your DB)
   - **Branch**: `main`
   - **Root Directory**: (Leave blank for repository root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     corepack pnpm install --frozen-lockfile && corepack pnpm --filter @kathaisolli/api build
     ```
   - **Pre-Deploy Command**:
     ```bash
     corepack pnpm db:deploy
     ```
   - **Start Command**:
     ```bash
     node apps/api/dist/main.js
     ```
   - **Health Check Path**: `/api/v1/health`
4. In **Environment Variables**, add the variables listed in Section 2A.
5. Click **Create Web Service**.

---

## 5. Frontend Deployments on Vercel

### A. Deploy User Website (`apps/web`)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select `-Kathaisolli-project`.
3. Configure the Project:
   - **Project Name**: `kathaisolli-web`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `apps/web`
   - **Build & Development Settings**:
     - Build Command: `pnpm run build`
     - Output Directory: `dist`
     - Install Command: `pnpm install`
4. Add the Environment Variables from Section 2B.
5. Click **Deploy**.

### B. Deploy Admin Website (`apps/admin`)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select the same `-Kathaisolli-project` repository.
3. Configure the Project:
   - **Project Name**: `kathaisolli-admin`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `apps/admin`
   - **Build & Development Settings**:
     - Build Command: `pnpm run build`
     - Output Directory: `dist`
     - Install Command: `pnpm install`
4. Add the Environment Variables from Section 2C.
5. Click **Deploy**.

---

## 6. Firebase Audio Storage Verification

The production audio catalog points directly to Google Cloud / Firebase Storage:
- **Bucket**: `vaagai-audio-books-36a4e.appspot.com`
- **MIME Type**: `audio/ogg` / `audio/mpeg`
- **Streaming**: Verified with HTTP 206 Partial Content / `Accept-Ranges: bytes`
- **CORS Config**: `cors.json` at root allows cross-origin streaming with `GET` and `HEAD` methods:
  ```json
  [
    {
      "origin": ["*"],
      "method": ["GET", "HEAD"],
      "maxAgeSeconds": 3600,
      "responseHeader": ["Content-Type", "Content-Range", "Accept-Ranges"]
    }
  ]
  ```
To apply this CORS rule to your Firebase Storage bucket via Google Cloud CLI:
```bash
gcloud storage buckets update gs://vaagai-audio-books-36a4e.appspot.com --cors-file=cors.json
```

---

## 7. Post-Deployment Verification Checklist

- [ ] **Health Endpoint**: `curl https://<your-render-domain>/api/v1/health` returns `{"status":"ok",...}`.
- [ ] **API Docs / Status**: `curl https://<your-render-domain>/api/v1` returns status ok.
- [ ] **Web SPA Routing**: Opening `https://<your-web-domain>/explore` or refreshing `https://<your-web-domain>/player` does not 404.
- [ ] **Admin Routing**: Accessing `https://<your-admin-domain>/books` redirects unauthenticated users to `/login`.
- [ ] **Audio Playback**: Playing a story streams immediately without CORS errors or broken duration indicators.
- [ ] **Chapter Navigation**: Next/Previous track advances properly in the player.
- [ ] **Sign Out**: The confirmation modal opens and clears token and session cleanly.

---

## 8. Troubleshooting Guide

### 1. API Returns 500 on Start / Database Error
- Check that your `DATABASE_URL` ends with `?sslmode=require` if using managed Postgres (Neon, Supabase, Render).
- Ensure IP access lists on your Postgres provider allow connections from anywhere (`0.0.0.0/0`), as Render web services have dynamic outbound IPs.

### 2. Redis Connection Refused
- In development, BullMQ and Redis are local. In production, provide an Upstash Redis or Render Redis connection string.
- Upstash Redis requires TLS (`rediss://...`), which is automatically supported by `apps/api/src/media/redis-connection.ts`.

### 3. Vercel Page Refresh 404
- Handled automatically by the `vercel.json` rewrites in `apps/web/vercel.json` and `apps/admin/vercel.json`:
  ```json
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
  ```

### 4. Audio Fails to Play on Mobile / Safari
- Safari requires `Accept-Ranges: bytes` and returns status `206 Partial Content`.
- Verified working on the Firebase bucket storage URLs.
