-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" VARCHAR(60);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users"("username");
