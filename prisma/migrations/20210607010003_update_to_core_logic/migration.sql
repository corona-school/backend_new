/*
  Warnings:

  - You are about to drop the `Offer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PupilMatchRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestMatches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VolunteerMatchRequest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `grade` to the `Pupil` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matching_priority` to the `Pupil` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InternshipModule" AS ENUM ('Praktikum', 'Seminar');

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_volunteerId_fkey";

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
ALTER TABLE "AuthenticationData" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Pupil" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "grade" TEXT NOT NULL,
ADD COLUMN     "matching_priority" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isUniversityStudent" BOOLEAN,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "university" TEXT;

-- DropTable
DROP TABLE "Offer";

-- DropTable
DROP TABLE "PupilMatchRequest";

-- DropTable
DROP TABLE "RequestMatches";

-- DropTable
DROP TABLE "VolunteerMatchRequest";

-- CreateTable
CREATE TABLE "UserRoles" (
    "id" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOffer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "imageKey" TEXT,
    "times" TEXT NOT NULL,
    "participantContactEmail" TEXT,
    "targetGroup" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteersOnCourses" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerId" TEXT NOT NULL,
    "courseOfferId" TEXT NOT NULL,

    PRIMARY KEY ("volunteerId","courseOfferId")
);

-- CreateTable
CREATE TABLE "TutoringOffer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerId" TEXT NOT NULL,
    "languages" TEXT[],
    "supportsInDaz" BOOLEAN,
    "subjects" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

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
CREATE TABLE "CourseParticipantMatchRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUnitil" TIMESTAMP(3),
    "pupilId" TEXT NOT NULL,
    "parameters" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseInstructorMatchRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUnitil" TIMESTAMP(3),
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
    "active" BOOLEAN NOT NULL,
    "tutorMatchRequestId" TEXT NOT NULL,
    "tuteeMatchRequestId" TEXT NOT NULL,

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
CREATE TABLE "CourseMatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL,
    "participantMatchRequestId" TEXT NOT NULL,
    "instructorMatchRequestId" TEXT NOT NULL,

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

-- CreateTable
CREATE TABLE "InternshipData" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerId" TEXT NOT NULL,
    "module" "InternshipModule" NOT NULL,
    "moduleHours" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRoles.userId_roleName_unique" ON "UserRoles"("userId", "roleName");

-- CreateIndex
CREATE UNIQUE INDEX "TutoringMatch_tutorMatchRequestId_unique" ON "TutoringMatch"("tutorMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "TutoringMatch_tuteeMatchRequestId_unique" ON "TutoringMatch"("tuteeMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCoachingMatch_coachMatchRequestId_unique" ON "ProjectCoachingMatch"("coachMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCoachingMatch_coacheeMatchRequestId_unique" ON "ProjectCoachingMatch"("coacheeMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMatch_participantMatchRequestId_unique" ON "CourseMatch"("participantMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMatch_instructorMatchRequestId_unique" ON "CourseMatch"("instructorMatchRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCoachingExpert_volunteerId_unique" ON "ProjectCoachingExpert"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipData_volunteerId_unique" ON "InternshipData"("volunteerId");

-- AddForeignKey
ALTER TABLE "UserRoles" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteersOnCourses" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteersOnCourses" ADD FOREIGN KEY ("courseOfferId") REFERENCES "CourseOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringOffer" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachingOffer" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseParticipantMatchRequest" ADD FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInstructorMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "CourseOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "TutoringOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuteeMatchRequest" ADD FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringMatch" ADD FOREIGN KEY ("tutorMatchRequestId") REFERENCES "TutorMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringMatch" ADD FOREIGN KEY ("tuteeMatchRequestId") REFERENCES "TuteeMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "ProjectCoachingOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoacheeMatchRequest" ADD FOREIGN KEY ("pupilId") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachingMatch" ADD FOREIGN KEY ("coachMatchRequestId") REFERENCES "ProjectCoachMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachingMatch" ADD FOREIGN KEY ("coacheeMatchRequestId") REFERENCES "ProjectCoacheeMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMatch" ADD FOREIGN KEY ("participantMatchRequestId") REFERENCES "CourseParticipantMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMatch" ADD FOREIGN KEY ("instructorMatchRequestId") REFERENCES "CourseInstructorMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCoachingExpert" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipData" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
