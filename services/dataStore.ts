import { PrismaClient } from '@prisma/client';
import { logError } from './logger';

const prisma = new PrismaClient();

export async function addUser(details: {
    firstName: string;
    lastName: string | null;
    email: string;
    notificationLevel: 'all' | 'necessary';
    phone: string;
}) {
    return prisma.user.create({ data: details });
}

export async function getPendingEmailNotifications() {
    return prisma.emailNotifications.findMany({
        where: {
            status: 'pending',
        },
    });
}
export async function getPendingEmailNotificationIds() {
    return prisma.emailNotifications.findMany({
        where: {
            status: 'pending',
        },
        select: {
            id: true,
        },
    });
}

export async function getPendingTextNotifications() {
    return prisma.textNotifications.findMany({
        where: {
            status: 'pending',
        },
    });
}

export async function addTextNotification(
    sender: string,
    recipient: string,
    message: string
) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                phone: recipient,
            },
        });

        return prisma.textNotifications.create({
            data: {
                sender: sender,
                recipientPhone: recipient,
                text: message,
            },
        });
    } catch (e) {
        logError('Problem adding the text message. Error:' + e);
    }
}

export async function addEmailNotification(
    recipient: string,
    sender: string,
    subject: string,
    templateID: number,
    variables: object,
    status?: 'pending' | 'sent' | undefined,
    priority?: 'high' | 'low' | undefined
) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: recipient,
            },
        });
        if (user != null) {
            const notification = await prisma.emailNotifications.create({
                data: {
                    recipientName: user.firstName,
                    recipientEmail: recipient,
                    sender: sender,
                    subject: subject,
                    variables: JSON.stringify(variables),
                    template: templateID.toString(),
                    status: status === undefined ? 'pending' : status,
                    priority: priority === undefined ? 'low' : 'high',
                },
            });
            return {
                status: 200,
                res: notification.id.toString(),
            };
        } else {
            logError('Mail recipient ' + recipient + ' does not exist');
            return {
                status: 400,
                res: 'Mail recipient ' + recipient + ' does not exist',
            };
        }
    } catch (e) {
        return {
            status: 400,
            res: 'Problem adding email to the pending list. Error:' + e,
        };
    }
}

export async function markEmailNotification(
    notificationId: string,
    status: 'sent' | 'error'
) {
    return prisma.emailNotifications.update({
        where: {
            id: notificationId,
        },
        data: {
            status: status,
        },
    });
}

export async function markTextNotification(
    notificationId: string,
    status: 'sent' | 'error'
) {
    return prisma.textNotifications.update({
        where: {
            id: notificationId,
        },
        data: {
            status: status,
        },
    });
}
