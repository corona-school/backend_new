import { PrismaClient, User } from '@prisma/client';
import { decode, verify } from 'jsonwebtoken';
import { baseURL } from './baseURL';
import { generateOnetimeToken, signForgotToken } from './jwt_signature';
import { keys } from './secretKeys';
import jwt from 'jsonwebtoken';
import passport from 'passport';

const prisma = new PrismaClient();

export const findUserByEmail = (email: string) => {
    return prisma.user.findUnique({
        where: {
            email,
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

    const emailLink = `${baseURL}/email/${user.id}/${emailToken}`;
    return emailLink;
};

export const generatePasswordLink = (user: any, authData: any) => {
    const secret = `${authData.password}${keys.accessTokenKey}`;

    const forgotToken = signForgotToken(user.id, secret);

    const passwordResetLink = `${baseURL}/password/${user.id}/${forgotToken}`;
    return passwordResetLink;
};

export const generatePhoneLink = (user: User) => {
    const secret = `${user.phone}${keys.accessTokenKey}`;

    const phoneToken = generateOnetimeToken(user.id, secret);

    const phoneLink = `${baseURL}/phone/${user.id}/${phoneToken}`;
    return phoneLink;
};

export const getUserAuthData = (userId: string) => {
    return prisma.authenticationData.findFirst({
        where: {
            userId,
        },
    });
};

export const isEmailVerified = (email: string) => {
    return prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            email: true,
            emailVerified: true,
        },
    });
};

export const isPhoneVerified = (phone: string) => {
    return prisma.user.findUnique({
        where: {
            phone,
        },
        select: {
            phone: true,
            phoneVerified: true,
        },
    });
};

export const getVolunteer = (userId: string) => {
    return prisma.volunteer.findFirst({
        where: {
            userId,
        },
    });
};

export const userToVolunteer = (userId: string) => {
    return prisma.volunteer.create({
        data: {
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });
};

export const getPupil = (userId: string) => {
    return prisma.pupil.findFirst({
        where: {
            userId,
        },
    });
};

export const userToPupil = async (userId: string) => {
    // return await prisma.pupil.create({
    //     data: {
    //         user: {
    //             connect: {
    //                 id: userId,
    //             },
    //         },
    //     },
    // });
};
