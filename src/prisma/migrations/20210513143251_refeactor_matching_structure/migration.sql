/*
  Warnings:

  - You are about to drop the column `requestor` on the `CourseInstructorMatchRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pupilReqId` on the `CourseMatch` table. All the data in the column will be lost.
  - You are about to drop the column `volunteerReqId` on the `CourseMatch` table. All the data in the column will be lost.
  - You are about to drop the column `parameters` on the `TutoringOffer` table. All the data in the column will be lost.
  - You are about to drop the `Offer` table. If the table is not empty, all the data it contains will be lost.
  - The migration will add a unique constraint covering the columns `[instructorMatchRequestId]` on the table `CourseMatch`. If there are existing duplicate values, the migration will fail.
  - Added the required column `active` to the `CourseMatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantMatchRequestId` to the `CourseMatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructorMatchRequestId` to the `CourseMatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `active` to the `TutoringMatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjects` to the `TutoringOffer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InternshipModule" AS ENUM ('Praktikum', 'Seminar');

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "CourseInstructorMatchRequest" DROP CONSTRAINT "CourseInstructorMatchRequest_offerId_fkey";

-- DropForeignKey
ALTER TABLE "CourseInstructorMatchRequest" DROP CONSTRAINT "CourseInstructorMatchRequest_requestor_fkey";

-- DropForeignKey
ALTER TABLE "CourseMatch" DROP CONSTRAINT "CourseMatch_pupilReqId_fkey";

-- DropForeignKey
ALTER TABLE "CourseMatch" DROP CONSTRAINT "CourseMatch_volunteerReqId_fkey";

-- AlterTable
ALTER TABLE "CourseInstructorMatchRequest" DROP COLUMN "requestor";

-- AlterTable
ALTER TABLE "CourseMatch" DROP COLUMN "pupilReqId",
DROP COLUMN "volunteerReqId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "active" BOOLEAN NOT NULL,
ADD COLUMN     "participantMatchRequestId" TEXT NOT NULL,
ADD COLUMN     "instructorMatchRequestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TutoringMatch" ADD COLUMN     "active" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "TutoringOffer" DROP COLUMN "parameters",
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "supportsInDaz" BOOLEAN,
ADD COLUMN     "subjects" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "university" TEXT;

-- DropTable
DROP TABLE "Offer";

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
CREATE TABLE "InternshipData" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "module" "InternshipModule" NOT NULL,
    "moduleHours" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternshipData_volunteerId_unique" ON "InternshipData"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMatch_instructorMatchRequestId_unique" ON "CourseMatch"("instructorMatchRequestId");

-- AddForeignKey
ALTER TABLE "VolunteersOnCourses" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteersOnCourses" ADD FOREIGN KEY ("courseOfferId") REFERENCES "CourseOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipData" ADD FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInstructorMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "CourseOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMatch" ADD FOREIGN KEY ("participantMatchRequestId") REFERENCES "CourseParticipantMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMatch" ADD FOREIGN KEY ("instructorMatchRequestId") REFERENCES "CourseInstructorMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
