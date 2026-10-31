# Kathaisolli (கதைசொல்லி) — API Documentation

API Base URL: `http://localhost:3000/api/v1`  
Swagger Documentation: `http://localhost:3000/api/docs`  
Authentication: Bearer JWT Access Token  
Content-Type: `application/json`

---

## 1. Authentication & User Profile (`/auth`)

### 1.1 Listener Registration
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "listener@example.com",
    "password": "secure-password-1234",
    "displayName": "Tamil Listener"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "email": "listener@example.com",
      "displayName": "Tamil Listener",
      "role": "LISTENER"
    }
  }
  ```

### 1.2 User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "listener@example.com",
    "password": "secure-password-1234"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "email": "listener@example.com",
      "displayName": "Tamil Listener",
      "role": "LISTENER"
    }
  }
  ```

### 1.3 Authenticated User Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Access**: Authenticated (Bearer Token)
- **Response** `200 OK`:
  ```json
  {
    "id": "uuid",
    "email": "listener@example.com",
    "displayName": "Tamil Listener",
    "role": "LISTENER",
    "creatorProfile": null,
    "createdAt": "2026-10-30T10:00:00.000Z"
  }
  ```

### 1.4 Profile Update
- **Endpoint**: `PATCH /api/v1/auth/profile`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "displayName": "Kavitha",
    "avatarUrl": "https://storage.kathaisolli.local/avatars/user-1.jpg"
  }
  ```

---

## 2. Public Catalog (`/catalog`, `/home`, `/series`, `/categories`, `/languages`)

### 2.1 Home Discovery Feed
- **Endpoint**: `GET /api/v1/home`
- **Access**: Public (100% Free)
- **Response** `200 OK`:
  ```json
  {
    "featuredSeries": [...],
    "trendingSeries": [...],
    "popularTamilSeries": [...],
    "newlyReleased": [...],
    "popularCategories": [...],
    "popularCreators": [...]
  }
  ```

### 2.2 Category Listing
- **Endpoint**: `GET /api/v1/categories`
- **Access**: Public
- **Response** `200 OK`: Array of active categories (e.g. Romance, Horror, History, Children, Mythology, Sci-Fi).

### 2.3 Language Listing
- **Endpoint**: `GET /api/v1/languages`
- **Access**: Public
- **Response** `200 OK`: Array of supported languages (e.g., Tamil `ta`).

### 2.4 Search & Series Exploration
- **Endpoint**: `GET /api/v1/search?q=பொன்னியின்&categoryId=...&languageId=...`
- **Access**: Public
- **Endpoint**: `GET /api/v1/series/:slug`
- **Endpoint**: `GET /api/v1/series/:slug/episodes`

---

## 3. Playback Authorization (`/playback`)

### 3.1 Authorize Episode Playback
- **Endpoint**: `POST /api/v1/playback/authorize`
- **Access**: Public / Authenticated (100% Free — No paywall, no subscription required)
- **Request Body**:
  ```json
  {
    "episodeId": "uuid"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "episodeId": "uuid",
    "seriesTitle": "பொன்னியின் செல்வன்",
    "episodeTitle": "அத்தியாயம் 1: ஆதித்த கரிகாலன்",
    "streamUrl": "http://localhost:9000/kathaisolli-audio/episodes/.../master.m3u8?AWSAccessKeyId=...",
    "durationSec": 1420,
    "expiresAt": "2026-10-30T10:35:00.000Z"
  }
  ```

---

## 4. User Library (`/library`, `/playlists`)

### 4.1 Favorites Management
- **GET /api/v1/library/favorites**: Get user's saved stories/series.
- **POST /api/v1/library/favorites/:seriesId**: Add series to favorites.
- **DELETE /api/v1/library/favorites/:seriesId**: Remove from favorites.

### 4.2 Listening History & Playback Progress
- **GET /api/v1/library/history**: User's recent listening history.
- **PUT /api/v1/library/progress**: Sync playback position (device, episodeId, positionSec, completedFlag).
- **GET /api/v1/library/continue-listening**: Continue listening shelf for active user.

### 4.3 Custom Playlists
- **GET /api/v1/playlists**: List user playlists.
- **POST /api/v1/playlists**: Create a new playlist.
- **POST /api/v1/playlists/:id/items**: Add episode to playlist.
- **DELETE /api/v1/playlists/:id/items/:itemId**: Remove episode from playlist.

---

## 5. Creator Studio (`/creator`)

### 5.1 Creator Verification & Application
- **POST /api/v1/creator/apply**: Submit application to become a creator.
- **GET /api/v1/creator/status**: Check approval status and feedback.

### 5.2 Content Authoring
- **GET /api/v1/creator/series**: List series owned by the creator.
- **POST /api/v1/creator/series**: Create series draft.
- **POST /api/v1/creator/series/:seriesId/seasons**: Create season.
- **POST /api/v1/creator/episodes**: Create episode draft.
- **POST /api/v1/creator/series/:seriesId/submit**: Submit series for admin moderation.

### 5.3 Creator Analytics
- **GET /api/v1/creator/analytics**: Plays, total listening hours, episode completion rates.

---

## 6. Audio Uploads & Processing (`/uploads`)

### 6.1 Upload Initiation
- **Endpoint**: `POST /api/v1/uploads/initiate`
- **Access**: Creator / Admin
- **Request Body**:
  ```json
  {
    "episodeId": "uuid",
    "filename": "chapter-1.mp3",
    "contentType": "audio/mpeg",
    "sizeBytes": 24500000
  }
  ```
- **Response** `201 Created`: Presigned POST data with direct S3 upload url and policy fields.

### 6.2 Upload Completion & Queuing
- **Endpoint**: `POST /api/v1/uploads/:id/complete`
- **Response** `200 OK`: Upload verified and BullMQ transcoding job queued.

### 6.3 Upload Status
- **Endpoint**: `GET /api/v1/uploads/:id/status`

---

## 7. Super Admin Management (`/admin`)

### 7.1 Dashboard KPIs
- **GET /api/v1/admin/metrics**: Platform totals (users, active listeners, creators, stories, audio hours, moderation counts).

### 7.2 Content Moderation
- **GET /api/v1/admin/moderation/pending**: Pending series and episodes.
- **POST /api/v1/admin/series/:seriesId/review**: Approve or reject series with notes.
- **POST /api/v1/admin/episodes/:episodeId/review**: Approve or reject episode with notes.
- **POST /api/v1/admin/series/:seriesId/publish**: Publish approved series.

### 7.3 User & Creator Moderation
- **GET /api/v1/admin/users**: Search and filter users.
- **PATCH /api/v1/admin/users/:id/status**: Suspend or reactivate user account.
- **POST /api/v1/admin/creators/:id/approve**: Approve creator application.

---

## 8. AI Story Assistant (`/ai-assistant`)

- **POST /api/v1/ai-assistant/generate-ideas**: Generates Tamil storytelling concepts and prompts.
- **POST /api/v1/ai-assistant/suggest-titles**: Suggests captivating titles and subtitles.
- **POST /api/v1/ai-assistant/grammar-check**: Tamil grammar analysis and style polish.
- **POST /api/v1/ai-assistant/summarize**: Generates episode synopsis and chapter markers.
