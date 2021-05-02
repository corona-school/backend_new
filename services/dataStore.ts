import { PrismaClient } from '@prisma/client';
import { logError } from './logger';
import bcrypt from 'bcrypt';
import { token } from '../routes/tokenRefresh';
import { User } from '../dataModel/types/user';

class dataStore {
    static prisma = new PrismaClient();
}

export async function findUser(
    constraint: { id: string } | { email: string }
): Promise<{ users: User[]; count: number }> {
    const users = await dataStore.prisma.user.findMany({
        where: constraint,
    });
    return { users: users, count: users.length };
}

export async function findRole(roleName: string) {
    return dataStore.prisma.roles.findUnique({
        where: {
            name: roleName,
        },
    });
}

export async function getUserRole(id: string) {
    return dataStore.prisma.userRoles.groupBy({
        by: ['roleName'],
        where: {
            userId: id,
        },
    });
}

export async function checkUserAllowedFor(userId: string, task: string) {
    const taskDetail = await dataStore.prisma.tasks.findUnique({
        where: {
            name: task,
        },
    });
    if (taskDetail === null) {
        return false;
    }

    const userRole = await dataStore.prisma.userRoles.findMany({
        where: {
            userId: userId,
        },
        include: {
            role: true,
        },
    });

    const allowed = userRole.filter(
        (roleDetail) => roleDetail.role.level <= taskDetail.minLevelRequired
    );
    if (allowed.length != 0) {
        return true;
    }
    return false;
}

export async function addUser(details: {
    firstName: string;
    lastName: string | null;
    email: string;
    notificationLevel: 'all' | 'necessary';
    phone: string;
    password: string;
}) {
    const user = await dataStore.prisma.user.create({
        data: {
            firstName: details.firstName,
            lastName: details.lastName,
            email: details.email,
            phone: details.phone,
        },
    });

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(details.password, salt);

    const authdata = await dataStore.prisma.authenticationData.create({
        data: {
            password: hash,
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    });
    return user;
}

export async function getUserCount() {
    return dataStore.prisma.user.count();
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

export async function addTask(taskObject: {
    name: string;
    minLevelRequired: number;
}) {
    return dataStore.prisma.tasks.create({
        data: taskObject,
    });
}
export async function addRole(role: { name: string; level: number }) {
    return dataStore.prisma.roles.create({
        data: { name: role.name, level: role.level },
    });
}

export async function assignRoleToUser(userId: string, roleName: string) {
    return dataStore.prisma.userRoles.create({
        data: { userId: userId, roleName: roleName },
    });
}

//This function is only intended to be used for modifying data model during tests.
//Please refrain from using this in general use for deleting users.
export async function deleteUser(email: string) {
    const foundUsers = await findUser({ email: email });
    const authData = await dataStore.prisma.authenticationData.findMany({
        where: {
            userId: foundUsers.users[0].id,
        },
    });
    await dataStore.prisma.refreshToken.deleteMany({
        where: {
            authId: authData[0].id,
        },
    });
    await dataStore.prisma.authenticationData.deleteMany({
        where: {
            userId: foundUsers.users[0].id,
        },
    });
    await dataStore.prisma.emailNotifications.deleteMany({
        where: {
            recipientEmail: email,
        },
    });
    if (foundUsers.users[0].phone !== null) {
        await dataStore.prisma.textNotifications.deleteMany({
            where: {
                recipientPhone: foundUsers.users[0].phone,
            },
        });
    }

    await dataStore.prisma.userRoles.deleteMany({
        where: {
            userId: foundUsers.users[0].id,
        },
    });

    await dataStore.prisma.user.delete({
        where: {
            email: email,
        },
    });

    return true;
}

export async function getRefreshTokenFromAuthId(authId: string) {
    const tokens = await dataStore.prisma.refreshToken.findFirst({
        where: {
            authId: authId,
        },
    });
    return tokens === null ? { token: undefined } : tokens;
}

export async function disconnectPrisma() {
    await dataStore.prisma.$disconnect();
}

export async function getRefreshTokenObject(refreshToken: string) {
    const tokenObject = await dataStore.prisma.refreshToken.findMany({
        where: {
            token: refreshToken,
            valid: true,
        },
    });

    return tokenObject.length === 0 ? [] : tokenObject;
}

export async function setupTestRoles() {
    await dataStore.prisma.roles.createMany({
        data: [
            { name: 'unitTestPupil', level: 3 },
            { name: 'unitTestVolunteer', level: 2 },
            { name: 'unitTestAdmin', level: 1 },
        ],
    });
    return true;
}

export async function setupTestUserAdminRole(id: string) {
    await dataStore.prisma.userRoles.create({
        data: { userId: id, roleName: 'unitTestAdmin' },
    });
}

export async function setupTestUserPupilRole(id: string) {
    await dataStore.prisma.userRoles.create({
        data: { userId: id, roleName: 'unitTestPupil' },
    });
}

export async function deleteTestRoles() {
    await dataStore.prisma.roles.deleteMany({
        where: {
            name: {
                contains: 'unitTest',
            },
        },
    });
    return true;
}
export async function setupTestTasks() {
    await dataStore.prisma.tasks.createMany({
        data: [
            { name: 'createRole', minLevelRequired: 1 },
            { name: 'assignRole', minLevelRequired: 1 },
        ],
    });
    return true;
}

export async function tearDownTestTasks() {
    await dataStore.prisma.tasks.deleteMany({});
    return true;
}
