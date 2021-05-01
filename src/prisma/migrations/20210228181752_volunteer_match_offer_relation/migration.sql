/*
  Warnings:

  - Added the required column `offerId` to the `VolunteerMatchRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VolunteerMatchRequest" ADD COLUMN     "offerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "VolunteerMatchRequest" ADD FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
