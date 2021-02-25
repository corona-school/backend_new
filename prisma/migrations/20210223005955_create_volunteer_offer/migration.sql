/*
  Warnings:

  - The migration will change the primary key for the `Pupil` table. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Volunteer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pupil" DROP CONSTRAINT "Pupil_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "Pupil_id_seq";

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "id" TEXT NOT NULL,
ADD PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "volunteerId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);
