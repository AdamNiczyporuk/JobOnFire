/*
  Warnings:

  - The `jobLevel` column on the `jobOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `workingMode` column on the `jobOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `responsibilities` column on the `jobOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `requirements` column on the `jobOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `whatWeOffer` column on the `jobOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tags` column on the `jobOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "jobOffer" DROP COLUMN "jobLevel",
ADD COLUMN     "jobLevel" JSONB,
DROP COLUMN "workingMode",
ADD COLUMN     "workingMode" JSONB,
DROP COLUMN "responsibilities",
ADD COLUMN     "responsibilities" JSONB,
DROP COLUMN "requirements",
ADD COLUMN     "requirements" JSONB,
DROP COLUMN "whatWeOffer",
ADD COLUMN     "whatWeOffer" JSONB,
DROP COLUMN "tags",
ADD COLUMN     "tags" JSONB;

-- DropEnum
DROP TYPE "ContractType";
