//This function is only intended to be used for modifying data model during tests.
//Please refrain from using this in general use for deleting users.
import { dataStore } from './dataStore';
import { findUser } from './types/user';

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
