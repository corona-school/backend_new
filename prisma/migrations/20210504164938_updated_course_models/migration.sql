/*
  Warnings:

  - The `time` column on the `Offer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `validUntil` to the `VolunteerMatchRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "time",
ADD COLUMN     "time" TIMESTAMP(3)[];

-- AlterTable
ALTER TABLE "PupilMatchRequest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "VolunteerMatchRequest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validUntil" TIMESTAMP(3) NOT NULL;
