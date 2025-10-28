-- CreateTable
CREATE TABLE "recruitmentTest" (
    "id" SERIAL NOT NULL,
    "testJson" JSONB,
    "jobOfferId" INTEGER NOT NULL,

    CONSTRAINT "recruitmentTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recruitmentTest_jobOfferId_key" ON "recruitmentTest"("jobOfferId");

-- AddForeignKey
ALTER TABLE "recruitmentTest" ADD CONSTRAINT "recruitmentTest_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "jobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
