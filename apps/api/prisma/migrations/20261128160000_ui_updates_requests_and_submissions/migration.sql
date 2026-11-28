-- Add terms_accepted_at to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMP(3);

-- Create password_reset_requests table
CREATE TABLE IF NOT EXISTS "password_reset_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "username" VARCHAR(60) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "requested_password_hash" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "acknowledged_note" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "review_note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "password_reset_requests_status_created_at_idx" ON "password_reset_requests"("status", "created_at");
CREATE INDEX IF NOT EXISTS "password_reset_requests_email_idx" ON "password_reset_requests"("email");

-- Create story_submissions table
CREATE TABLE IF NOT EXISTS "story_submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "book_title" VARCHAR(200) NOT NULL,
    "author_name" VARCHAR(160) NOT NULL,
    "narrator_name" VARCHAR(160),
    "archive_url" VARCHAR(2048) NOT NULL,
    "archive_file_name" VARCHAR(255) NOT NULL,
    "archive_size_bytes" BIGINT,
    "acknowledged_note" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "review_note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "story_submissions_status_created_at_idx" ON "story_submissions"("status", "created_at");
CREATE INDEX IF NOT EXISTS "story_submissions_email_idx" ON "story_submissions"("email");
