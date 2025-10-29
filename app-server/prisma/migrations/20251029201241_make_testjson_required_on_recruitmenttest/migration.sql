/*
  Warnings:

  - Made the column `testJson` on table `recruitmentTest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "recruitmentTest" ALTER COLUMN "testJson" SET NOT NULL;
