/*
  Warnings:

  - The `experience` column on the `candidateProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skills` column on the `candidateProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `education` column on the `candidateProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "candidateProfile" DROP COLUMN "experience",
ADD COLUMN     "experience" JSONB,
DROP COLUMN "skills",
ADD COLUMN     "skills" JSONB,
DROP COLUMN "education",
ADD COLUMN     "education" JSONB;
