/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Pupil` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Pupil` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Pupil` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Pupil` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Pupil` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Volunteer` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[userId]` on the table `Pupil`. If there are existing duplicate values, the migration will fail.
  - The migration will add a unique constraint covering the columns `[userId]` on the table `Volunteer`. If there are existing duplicate values, the migration will fail.
  - Added the required column `userId` to the `Pupil` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Volunteer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Pupil.email_unique";

-- DropIndex
DROP INDEX "Volunteer.email_unique";

-- AlterTable
ALTER TABLE "Pupil" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pupil_userId_unique" ON "Pupil"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_userId_unique" ON "Volunteer"("userId");

-- AddForeignKey
ALTER TABLE "Pupil" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
