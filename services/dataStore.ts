import { PrismaClient } from '@prisma/client';
import { text } from 'express';
import { logError } from './logger';

const prisma = new PrismaClient();

export async function getUser(clause: { email: string }) {
    const user = prisma.user.findUnique({
        where: clause,
    });

    return user;
}

export async function addUser(details: {
    firstName: string;
    lastName: string;
    email: string;
}) {
    const user = prisma.user.create({ data: details });
    return user;
}
export async function getPendingNotifications() {
    const notifications = prisma.notifications.findMany({
        where: {
            status: 'pending',
        },
    });
    return notifications;
}

export async function addNotification(
    recipient: string,
    content: { Subject: string; Message: string; HTMLContent?: string }
) {
    if (content.HTMLContent === undefined) {
        content.HTMLContent = '';
    }
    const user = prisma.user.findUnique({
        where: {
            email: recipient,
        },
    });

    user.then((response) => {
        if (response !== null) {
            const notification = prisma.notifications.create({
                data: {
                    recipientEmail: recipient,
                    subject: content.Subject,
                    textContent: content.Message,
                    htmlContent: content.HTMLContent,
                },
            });
            return notification;
        } else {
            logError('Mail recipient ' + recipient + ' does not exist');
        }
    });
}

export async function markNotification(notificationId: string) {
    const notification = prisma.notifications.update({
        where: {
            id: notificationId,
        },
        data: {
            status: 'sent',
        },
    });

    return notification;
}
