/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tasks.name_unique" ON "Tasks"("name");
