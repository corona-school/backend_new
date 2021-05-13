/*
  Warnings:

  - You are about to drop the column `parameters` on the `CourseInstructorMatchRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestor` on the `CourseParticipantMatchRequest` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[participantMatchRequestId]` on the table `CourseMatch`. If there are existing duplicate values, the migration will fail.
  - Added the required column `times` to the `CourseOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pupilId` to the `CourseParticipantMatchRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseParticipantMatchRequest" DROP CONSTRAINT "CourseParticipantMatchRequest_requestor_fkey";

-- AlterTable
ALTER TABLE "CourseInstructorMatchRequest" DROP COLUMN "parameters",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validUnitil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CourseOffer" ADD COLUMN     "times" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CourseParticipantMatchRequest" DROP COLUMN "requestor",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validUnitil" TIMESTAMP(3),
ADD COLUMN     "pupilId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InternshipData" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "isUniversityStudent" BOOLEAN;

-- CreateTable
CREATE TABLE "ProjectCoachingOffer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerId" TEXT NOT NULL,
    "wasJufoParticipant" BOOLEAN,
    "hasJufoCertificate" BOOLEAN,
    "jufoPastParticipationInfo" TEXT,
    "jufoPastParticipationConfirmed" BOOLEAN,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCoachMatchRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "offerId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCoacheeMatchRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pupilId" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3),
    "parameters" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCoachingMatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL,
    "coachMatchRequestId" TEXT NOT NULL,
    "coacheeMatchRequestId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCoachingExpert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "active" BOOLEAN NOT NULL,
    "published" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCoachingMatch_coachMatchRequestId_unique" ON "ProjectCoachingMatch"("coachMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCoachingMatch_coacheeMatchRequestId_unique" ON "ProjectCoachingMatch"("coacheeMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCoachingExpert_volunteerId_unique" ON "ProjectCoachingExpert"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMatch_participantMatchRequestId_unique" ON "CourseMatch"("participantMatchRequestId");

-- AddForeignKey
ALTER TABLE "ProjectCoachingOffer" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "ProjectCoachingOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoacheeMatchRequest" ADD FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachingMatch" ADD FOREIGN KEY ("coachMatchRequestId") REFERENCES "ProjectCoachMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachingMatch" ADD FOREIGN KEY ("coacheeMatchRequestId") REFERENCES "ProjectCoacheeMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachingExpert" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseParticipantMatchRequest" ADD FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;
