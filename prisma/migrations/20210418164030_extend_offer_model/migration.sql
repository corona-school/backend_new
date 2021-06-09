/*
  Warnings:

  - Added the required column `title` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_group` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "target_group" TEXT NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
