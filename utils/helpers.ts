import { PrismaClient, User } from '@prisma/client';
import { generateOnetimeToken, signForgotToken } from './jwt_signature';
import { keys } from './secretKeys';

const prisma = new PrismaClient();

export const findUserByEmail = (email: string) => {
    return prisma.user.findUnique({
        where: {
            email: email,
        },
    });
};

export const findUserById = (userId: string) => {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
};

export const addRefreshToken = (authId: string, token: string) => {
    return prisma.refreshToken.create({
        data: {
            token: token,
            authenticationData: {
                connect: {
                    id: authId,
                },
            },
        },
    });
};

export const isRefreshTokenValid = (authId: string) => {
    return prisma.refreshToken.findFirst({
        where: {
            authId: authId,
            valid: true,
        },
    });
};

export const findEmailToUser = (userid: string) => {
    return prisma.user
        .findUnique({
            where: {
                id: userid,
            },
            select: {
                email: true,
                emailVerified: true,
            },
        })
        .then((result) => {
            if (result != null) {
                return {
                    email: result.email,
                    emailVerified: result.emailVerified,
                };
            } else {
                return null;
            }
        })
        .catch((err) => {
            return err;
        });
};

export const findPhoneToUser = (userid: string) => {
    return prisma.user
        .findUnique({
            where: {
                id: userid,
            },
            select: {
                phone: true,
                phoneVerified: true,
            },
        })
        .then((result) => {
            if (result != null) {
                return {
                    phone: result.phone,
                    phoneVerified: result.phoneVerified,
                };
            } else {
                return null;
            }
        })
        .catch((err) => {
            return err;
        });
};

export const generateEmailLink = (user: User) => {
    const secret = `${user.email}${keys.accessTokenKey}`;

    const emailToken = generateOnetimeToken(user.id, secret);

    const emailLink = `localhost:4001/verification/email/${user.id}/${emailToken}`;
    return emailLink;
};

export const generatePasswordLink = (user: any, authData: any) => {
    const secret = `${authData.password}${keys.accessTokenKey}`;

    const forgotToken = signForgotToken(user.id, secret);

    const passwordResetLink = `localhost:4001/verification/password/${user.id}/${forgotToken}`;
    return passwordResetLink;
};

export const generatePhoneLink = (user: User) => {
    const secret = `${user.phone}${keys.accessTokenKey}`;

    const phoneToken = generateOnetimeToken(user.id, secret);

    const phoneLink = `localhost:4001/verification/phone/${user.id}/${phoneToken}`;
    return phoneLink;
};

export const getUserAuthData = (userId: string) => {
    return prisma.authenticationData.findFirst({
        where: {
            userId,
        },
    });
};

export const isEmailVerified = async (email: string) => {};

export const isPhoneVerified = async (email: string) => {};
