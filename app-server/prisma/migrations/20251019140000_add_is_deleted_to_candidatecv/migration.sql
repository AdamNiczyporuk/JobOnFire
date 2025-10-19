-- Add isDeleted column to candidateCV for soft delete
ALTER TABLE "candidateCV"
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;