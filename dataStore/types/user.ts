import { dataStore } from '../dataStore';
import bcrypt from 'bcrypt';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    active: boolean;
    notificationLevel: 'all' | 'necessary';
    phone: string | null;
}

export async function findUser(
    constraint: { id: string } | { email: string }
): Promise<{ users: User[]; count: number }> {
    const users = await dataStore.prisma.user.findMany({
        where: constraint,
    });
    return { users: users, count: users.length };
}

export async function getUserRole(id: string) {
    return dataStore.prisma.userRoles.groupBy({
        by: ['roleName'],
        where: {
            userId: id,
        },
    });
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
export async function getUserRoles(userId: string) {
    return dataStore.prisma.userRoles.findMany({
        where: {
            userId: userId,
        },
        select: {
            roleName: true,
        },
    });
}
export async function getUserCount() {
    return dataStore.prisma.user.count();
}
