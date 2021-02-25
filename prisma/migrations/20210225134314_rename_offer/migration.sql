/*
  Warnings:

  - You are about to drop the `offer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "offer" DROP CONSTRAINT "offer_pupilReqId_fkey";

-- DropForeignKey
ALTER TABLE "offer" DROP CONSTRAINT "offer_volunteerReqId_fkey";

-- CreateTable
CREATE TABLE "RequestMatches" (
    "id" TEXT NOT NULL,
    "pupilReqId" TEXT NOT NULL,
    "volunteerReqId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE "offer";

-- AddForeignKey
ALTER TABLE "RequestMatches" ADD FOREIGN KEY ("pupilReqId") REFERENCES "PupilMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestMatches" ADD FOREIGN KEY ("volunteerReqId") REFERENCES "VolunteerMatchRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
