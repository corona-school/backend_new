/*
  Warnings:

  - You are about to drop the `PupilMatchRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestMatches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VolunteerMatchRequest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `grade` to the `Pupil` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PupilMatchRequest" DROP CONSTRAINT "PupilMatchRequest_requestor_fkey";

-- DropForeignKey
ALTER TABLE "RequestMatches" DROP CONSTRAINT "RequestMatches_pupilReqId_fkey";

-- DropForeignKey
ALTER TABLE "RequestMatches" DROP CONSTRAINT "RequestMatches_volunteerReqId_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerMatchRequest" DROP CONSTRAINT "VolunteerMatchRequest_offerId_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerMatchRequest" DROP CONSTRAINT "VolunteerMatchRequest_requestor_fkey";

-- AlterTable
ALTER TABLE "Pupil" ADD COLUMN     "grade" TEXT NOT NULL;

-- DropTable
DROP TABLE "PupilMatchRequest";

-- DropTable
DROP TABLE "RequestMatches";

-- DropTable
DROP TABLE "VolunteerMatchRequest";

-- CreateTable
CREATE TABLE "TutoringOffer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerId" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseParticipantMatchRequest" (
    "id" TEXT NOT NULL,
    "requestor" TEXT NOT NULL,
    "parameters" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseInstructorMatchRequest" (
    "id" TEXT NOT NULL,
    "requestor" TEXT NOT NULL,
    "parameters" TEXT[],
    "offerId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorMatchRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "offerId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuteeMatchRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pupilId" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3),
    "parameters" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutoringMatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tutorMatchRequestId" TEXT NOT NULL,
    "tuteeMatchRequestId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMatch" (
    "id" TEXT NOT NULL,
    "pupilReqId" TEXT NOT NULL,
    "volunteerReqId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutoringMatch_tutorMatchRequestId_unique" ON "TutoringMatch"("tutorMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "TutoringMatch_tuteeMatchRequestId_unique" ON "TutoringMatch"("tuteeMatchRequestId");

-- AddForeignKey
ALTER TABLE "TutoringOffer" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseParticipantMatchRequest" ADD FOREIGN KEY ("requestor") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInstructorMatchRequest" ADD FOREIGN KEY ("requestor") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInstructorMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "TutoringOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuteeMatchRequest" ADD FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringMatch" ADD FOREIGN KEY ("tutorMatchRequestId") REFERENCES "TutorMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringMatch" ADD FOREIGN KEY ("tuteeMatchRequestId") REFERENCES "TuteeMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMatch" ADD FOREIGN KEY ("pupilReqId") REFERENCES "CourseParticipantMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMatch" ADD FOREIGN KEY ("volunteerReqId") REFERENCES "CourseInstructorMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
