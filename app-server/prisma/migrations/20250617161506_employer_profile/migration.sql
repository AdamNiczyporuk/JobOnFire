/*
  Warnings:

  - The `industry` column on the `employerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contractType` column on the `employerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `benefits` column on the `employerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "employerProfile" DROP COLUMN "industry",
ADD COLUMN     "industry" JSONB,
DROP COLUMN "contractType",
ADD COLUMN     "contractType" JSONB,
DROP COLUMN "benefits",
ADD COLUMN     "benefits" JSONB;
