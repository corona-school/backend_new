import { PrismaClient } from '@prisma/client';

import { logError } from '../services/logger';

export class dataStore {
    static prisma = new PrismaClient();
}

export async function getPendingEmailNotifications() {
    return dataStore.prisma.emailNotifications.findMany({
        where: {
            status: 'pending',
        },
    });
}
export async function getEmailNotifications(receiver: string) {
    return dataStore.prisma.emailNotifications.findMany({
        where: {
            recipientEmail: receiver,
        },
    });
}

export async function getTextNotifications(receiver: string) {
    return dataStore.prisma.textNotifications.findMany({
        where: {
            recipientPhone: receiver,
        },
    });
}

export async function getPendingEmailNotificationIds() {
    return dataStore.prisma.emailNotifications.findMany({
        where: {
            status: 'pending',
        },
        select: {
            id: true,
        },
    });
}

export async function getPendingTextNotifications() {
    return dataStore.prisma.textNotifications.findMany({
        where: {
            status: 'pending',
        },
    });
}

export async function addTextNotification(
    sender: string,
    recipient: string,
    message: string,
    status?: 'pending' | 'sent' | undefined
) {
    try {
        const user = await dataStore.prisma.user.findUnique({
            where: {
                phone: recipient,
            },
        });

        const notification = await dataStore.prisma.textNotifications.create({
            data: {
                sender: sender,
                recipientPhone: recipient,
                text: message,
                status: status === undefined ? 'pending' : status,
            },
        });

        return {
            status: 200,
            res: notification.id.toString(),
        };
    } catch (e) {
        logError('Problem adding the text message. Error:' + e);
        return {
            status: 400,
            res: 'Problem adding text message. ' + e,
        };
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
        const user = await dataStore.prisma.user.findUnique({
            where: {
                email: recipient,
            },
        });
        if (user != null) {
            const notification = await dataStore.prisma.emailNotifications.create(
                {
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
                }
            );
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
    return dataStore.prisma.emailNotifications.update({
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
    return dataStore.prisma.textNotifications.update({
        where: {
            id: notificationId,
        },
        data: {
            status: status,
        },
    });
}

export async function assignRoleToUser(userId: string, roleName: string) {
    return dataStore.prisma.userRoles.create({
        data: { userId: userId, roleName: roleName },
    });
}
export async function deleteRoleForUser(userId: string, roleName: string) {
    return dataStore.prisma.userRoles.deleteMany({
        where: {
            userId: userId,
            roleName: roleName,
        },
    });
}
