CREATE TYPE "ContentType" AS ENUM ('STORY', 'AUDIOBOOK', 'PODCAST', 'SHORT_STORY');
CREATE TYPE "ContentStatus" AS ENUM (
    'DRAFT',
    'PROCESSING',
    'PENDING_REVIEW',
    'SCHEDULED',
    'PUBLISHED',
    'REJECTED',
    'ARCHIVED'
);
CREATE TYPE "AgeRating" AS ENUM (
    'ALL_AGES',
    'AGE_7_PLUS',
    'AGE_13_PLUS',
    'AGE_16_PLUS',
    'AGE_18_PLUS'
);

CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "native_name" VARCHAR(80) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "series" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "short_description" VARCHAR(500) NOT NULL,
    "full_description" TEXT,
    "cover_image" VARCHAR(2048),
    "banner_image" VARCHAR(2048),
    "content_type" "ContentType" NOT NULL DEFAULT 'STORY',
    "language_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "creator_id" UUID,
    "author_name" VARCHAR(160),
    "narrator_name" VARCHAR(160),
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "age_rating" "AgeRating" NOT NULL DEFAULT 'ALL_AGES',
    "premium_flag" BOOLEAN NOT NULL DEFAULT false,
    "featured_flag" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seasons" (
    "id" UUID NOT NULL,
    "series_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "object_key" VARCHAR(512) NOT NULL,
    "content_type" VARCHAR(120) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "duration_sec" INTEGER,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "episodes" (
    "id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "episode_number" INTEGER NOT NULL,
    "duration_sec" INTEGER,
    "media_asset_id" UUID,
    "preview_duration" INTEGER,
    "premium_flag" BOOLEAN NOT NULL DEFAULT false,
    "release_date" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");
CREATE INDEX "series_status_published_at_idx" ON "series"("status", "published_at");
CREATE INDEX "series_language_id_status_idx" ON "series"("language_id", "status");
CREATE INDEX "series_category_id_status_idx" ON "series"("category_id", "status");
CREATE INDEX "series_creator_id_status_idx" ON "series"("creator_id", "status");
CREATE UNIQUE INDEX "seasons_series_id_number_key" ON "seasons"("series_id", "number");
CREATE UNIQUE INDEX "media_assets_object_key_key" ON "media_assets"("object_key");
CREATE UNIQUE INDEX "episodes_media_asset_id_key" ON "episodes"("media_asset_id");
CREATE UNIQUE INDEX "episodes_season_id_episode_number_key" ON "episodes"("season_id", "episode_number");
CREATE INDEX "episodes_status_release_date_idx" ON "episodes"("status", "release_date");

ALTER TABLE "series"
ADD CONSTRAINT "series_language_id_fkey"
FOREIGN KEY ("language_id") REFERENCES "languages"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "series"
ADD CONSTRAINT "series_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "categories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "series"
ADD CONSTRAINT "series_creator_id_fkey"
FOREIGN KEY ("creator_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "seasons"
ADD CONSTRAINT "seasons_series_id_fkey"
FOREIGN KEY ("series_id") REFERENCES "series"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "episodes"
ADD CONSTRAINT "episodes_season_id_fkey"
FOREIGN KEY ("season_id") REFERENCES "seasons"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "episodes"
ADD CONSTRAINT "episodes_media_asset_id_fkey"
FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
