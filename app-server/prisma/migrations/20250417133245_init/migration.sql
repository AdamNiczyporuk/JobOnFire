-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "registerDate" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "additionalCredentials" (
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "additionalCredentials_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "candidateProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "lastName" TEXT,
    "description" TEXT,
    "birthday" TIMESTAMP(3),
    "experience" TEXT,
    "phoneNumber" INTEGER,
    "skills" TEXT,
    "place" TEXT,
    "education" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "candidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employerProfile" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyImageUrl" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "contractType" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "benefits" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "employerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidateCV" (
    "id" SERIAL NOT NULL,
    "cvJson" TEXT,
    "candidateProfileId" INTEGER NOT NULL,
    "cvUrl" TEXT,
    "name" TEXT,

    CONSTRAINT "candidateCV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "externalJobOffer" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "site" TEXT,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "candidateProfileId" INTEGER NOT NULL,

    CONSTRAINT "externalJobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicationForJobOffer" (
    "id" SERIAL NOT NULL,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL,
    "candidateProfileId" INTEGER NOT NULL,
    "jobOfferId" INTEGER NOT NULL,
    "cvId" INTEGER NOT NULL,

    CONSTRAINT "applicationForJobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicationResponse" (
    "applicationForJobOfferId" INTEGER NOT NULL,
    "response" TEXT,

    CONSTRAINT "applicationResponse_pkey" PRIMARY KEY ("applicationForJobOfferId")
);

-- CreateTable
CREATE TABLE "candidateAnswer" (
    "applicationForJobOfferId" INTEGER NOT NULL,
    "recruitmentQuestionId" INTEGER NOT NULL,
    "answer" TEXT,

    CONSTRAINT "candidateAnswer_pkey" PRIMARY KEY ("applicationForJobOfferId","recruitmentQuestionId")
);

-- CreateTable
CREATE TABLE "jobOffer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "jobLevel" TEXT,
    "contractType" TEXT,
    "salary" TEXT,
    "createDate" TIMESTAMP(3) NOT NULL,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "workingMode" TEXT,
    "workload" TEXT,
    "responsibilities" TEXT,
    "requirements" TEXT,
    "whatWeOffer" TEXT,
    "applicationUrl" TEXT,
    "lokalizationId" INTEGER,
    "employerProfileId" INTEGER NOT NULL,

    CONSTRAINT "jobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokalization" (
    "id" SERIAL NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "street" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longtitude" DOUBLE PRECISION,

    CONSTRAINT "lokalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokalizationToEmployerProfile" (
    "employerProfileId" INTEGER NOT NULL,
    "lokalizationId" INTEGER NOT NULL,

    CONSTRAINT "lokalizationToEmployerProfile_pkey" PRIMARY KEY ("employerProfileId","lokalizationId")
);

-- CreateTable
CREATE TABLE "meeting" (
    "id" SERIAL NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "type" "MeetingType" NOT NULL,
    "contributors" TEXT,
    "onlineMeetingUrl" TEXT,
    "message" TEXT,
    "applicationForJobOfferId" INTEGER NOT NULL,

    CONSTRAINT "meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profileLink" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "candidateProfileId" INTEGER NOT NULL,

    CONSTRAINT "profileLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitmentQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT,
    "jobOfferId" INTEGER NOT NULL,

    CONSTRAINT "recruitmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "additionalCredentials_userId_key" ON "additionalCredentials"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "candidateProfile_userId_key" ON "candidateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employerProfile_userId_key" ON "employerProfile"("userId");

-- AddForeignKey
ALTER TABLE "additionalCredentials" ADD CONSTRAINT "additionalCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidateProfile" ADD CONSTRAINT "candidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employerProfile" ADD CONSTRAINT "employerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidateCV" ADD CONSTRAINT "candidateCV_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "externalJobOffer" ADD CONSTRAINT "externalJobOffer_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicationForJobOffer" ADD CONSTRAINT "applicationForJobOffer_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicationForJobOffer" ADD CONSTRAINT "applicationForJobOffer_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "jobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicationForJobOffer" ADD CONSTRAINT "applicationForJobOffer_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "candidateCV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicationResponse" ADD CONSTRAINT "applicationResponse_applicationForJobOfferId_fkey" FOREIGN KEY ("applicationForJobOfferId") REFERENCES "applicationForJobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidateAnswer" ADD CONSTRAINT "candidateAnswer_applicationForJobOfferId_fkey" FOREIGN KEY ("applicationForJobOfferId") REFERENCES "applicationForJobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidateAnswer" ADD CONSTRAINT "candidateAnswer_recruitmentQuestionId_fkey" FOREIGN KEY ("recruitmentQuestionId") REFERENCES "recruitmentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobOffer" ADD CONSTRAINT "jobOffer_employerProfileId_fkey" FOREIGN KEY ("employerProfileId") REFERENCES "employerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobOffer" ADD CONSTRAINT "jobOffer_lokalizationId_fkey" FOREIGN KEY ("lokalizationId") REFERENCES "lokalization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lokalizationToEmployerProfile" ADD CONSTRAINT "lokalizationToEmployerProfile_employerProfileId_fkey" FOREIGN KEY ("employerProfileId") REFERENCES "employerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lokalizationToEmployerProfile" ADD CONSTRAINT "lokalizationToEmployerProfile_lokalizationId_fkey" FOREIGN KEY ("lokalizationId") REFERENCES "lokalization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_applicationForJobOfferId_fkey" FOREIGN KEY ("applicationForJobOfferId") REFERENCES "applicationForJobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profileLink" ADD CONSTRAINT "profileLink_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "candidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitmentQuestion" ADD CONSTRAINT "recruitmentQuestion_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "jobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
