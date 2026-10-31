CREATE TYPE "UploadStatus" AS ENUM (
    'INITIATED',
    'UPLOADED',
    'QUEUED',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);

ALTER TABLE "series"
ADD COLUMN "moderation_note" TEXT,
ADD COLUMN "reviewed_at" TIMESTAMP(3),
ADD COLUMN "reviewed_by_id" UUID;

ALTER TABLE "episodes"
ADD COLUMN "moderation_note" TEXT,
ADD COLUMN "published_at" TIMESTAMP(3),
ADD COLUMN "reviewed_at" TIMESTAMP(3),
ADD COLUMN "reviewed_by_id" UUID;

CREATE TABLE "upload_jobs" (
    "id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "episode_id" UUID NOT NULL,
    "active_episode_id" UUID,
    "media_asset_id" UUID,
    "object_key" VARCHAR(512) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "content_type" VARCHAR(120) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'INITIATED',
    "failure_reason" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "uploaded_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "upload_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_renditions" (
    "id" UUID NOT NULL,
    "media_asset_id" UUID NOT NULL,
    "object_key" VARCHAR(512) NOT NULL,
    "content_type" VARCHAR(120) NOT NULL,
    "bitrate" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_renditions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscription_entitlements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider_reference" VARCHAR(255),
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscription_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "upload_jobs_media_asset_id_key" ON "upload_jobs"("media_asset_id");
CREATE UNIQUE INDEX "upload_jobs_object_key_key" ON "upload_jobs"("object_key");
CREATE UNIQUE INDEX "upload_jobs_active_episode_id_key" ON "upload_jobs"("active_episode_id");
CREATE INDEX "upload_jobs_requester_id_status_idx" ON "upload_jobs"("requester_id", "status");
CREATE INDEX "upload_jobs_episode_id_created_at_idx" ON "upload_jobs"("episode_id", "created_at");
CREATE INDEX "upload_jobs_status_updated_at_idx" ON "upload_jobs"("status", "updated_at");
CREATE UNIQUE INDEX "media_renditions_object_key_key" ON "media_renditions"("object_key");
CREATE INDEX "media_renditions_media_asset_id_idx" ON "media_renditions"("media_asset_id");
CREATE UNIQUE INDEX "subscription_entitlements_provider_reference_key" ON "subscription_entitlements"("provider_reference");
CREATE INDEX "subscription_entitlements_user_id_starts_at_expires_at_revoked_at_idx" ON "subscription_entitlements"("user_id", "starts_at", "expires_at", "revoked_at");

ALTER TABLE "series"
ADD CONSTRAINT "series_reviewed_by_id_fkey"
FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "episodes"
ADD CONSTRAINT "episodes_reviewed_by_id_fkey"
FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "upload_jobs"
ADD CONSTRAINT "upload_jobs_requester_id_fkey"
FOREIGN KEY ("requester_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "upload_jobs"
ADD CONSTRAINT "upload_jobs_episode_id_fkey"
FOREIGN KEY ("episode_id") REFERENCES "episodes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "upload_jobs"
ADD CONSTRAINT "upload_jobs_media_asset_id_fkey"
FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "media_renditions"
ADD CONSTRAINT "media_renditions_media_asset_id_fkey"
FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscription_entitlements"
ADD CONSTRAINT "subscription_entitlements_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
