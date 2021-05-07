/*
  Warnings:

  - You are about to drop the column `time` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `validUntil` on the `VolunteerMatchRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "time",
ADD COLUMN     "times" TEXT[];

-- AlterTable
ALTER TABLE "VolunteerMatchRequest" DROP COLUMN "validUntil";
