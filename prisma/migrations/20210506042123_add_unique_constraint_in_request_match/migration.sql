/*
  Warnings:

  - A unique constraint covering the columns `[pupilReqId,volunteerReqId]` on the table `RequestMatches` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RequestMatches.pupilReqId_volunteerReqId_unique" ON "RequestMatches"("pupilReqId", "volunteerReqId");
