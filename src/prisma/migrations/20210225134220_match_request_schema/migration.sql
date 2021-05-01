/*
  Warnings:

  - Added the required column `description` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PupilMatchRequest" (
    "id" TEXT NOT NULL,
    "requestor" TEXT NOT NULL,
    "parameters" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerMatchRequest" (
    "id" TEXT NOT NULL,
    "requestor" TEXT NOT NULL,
    "parameters" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" TEXT NOT NULL,
    "pupilReqId" TEXT NOT NULL,
    "volunteerReqId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PupilMatchRequest" ADD FOREIGN KEY ("requestor") REFERENCES "Pupil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerMatchRequest" ADD FOREIGN KEY ("requestor") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD FOREIGN KEY ("pupilReqId") REFERENCES "PupilMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD FOREIGN KEY ("volunteerReqId") REFERENCES "VolunteerMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
