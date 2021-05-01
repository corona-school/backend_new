-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL DEFAULT E'ayush.pandey@corona-school.de',
    "recipientEmail" TEXT NOT NULL,
    "TextContent" TEXT,
    "HTMLContent" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT E'pending',

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD FOREIGN KEY ("recipientEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
