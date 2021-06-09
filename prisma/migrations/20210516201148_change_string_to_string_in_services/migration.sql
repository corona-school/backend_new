-- AlterTable
ALTER TABLE "Offer" ALTER COLUMN "times" SET NOT NULL,
ALTER COLUMN "times" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PupilMatchRequest" ALTER COLUMN "parameters" SET NOT NULL,
ALTER COLUMN "parameters" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VolunteerMatchRequest" ALTER COLUMN "parameters" SET NOT NULL,
ALTER COLUMN "parameters" SET DATA TYPE TEXT;
