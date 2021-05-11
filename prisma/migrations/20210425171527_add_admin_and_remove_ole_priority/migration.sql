/*
  Warnings:

  - You are about to drop the column `priority` on the `Roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Roles" DROP COLUMN "priority";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Admin" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
