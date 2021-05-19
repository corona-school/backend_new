/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Tasks` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `Tasks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tasks.name_unique" ON "Tasks"("name");
