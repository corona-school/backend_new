import { Prisma, PrismaClient, User } from '@prisma/client';
import { logError } from '../../../services/logger';
import { generateOnetimeToken, signForgotToken } from './jwt_signature';
import { keys } from './secretKeys';

const prisma = new PrismaClient();

type userWithAuthData = Prisma.UserGetPayload<{
    select: {
        id: true;
        email: true;
        firstName: true;
        AuthenticationData: {
            select: { password: true };
        };
    };
}>;

export const addRefreshToken = async (userid: string, token: string) => {
    return await prisma.refreshToken.create({
        data: {
            token: token,
            user: {
                connect: { id: userid },
            },
        },
    });
};

export const isRefreshTokenValid = async (userid: string) => {
    return await prisma.user.findUnique({
        where: {
            id: userid,
        },
        select: {
            RefreshToken: {
                where: {
                    valid: true,
                },
            },
        },
    });
};

export const findEmailToUser = async (userid: string) => {
    return await prisma.user
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
                logError(`Couldn't find any email for the userid: ${userid}`);
            }
        });
};

export const findPhoneToUser = async (userid: string) => {
    return await prisma.user
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
                logError(`Couldn't find any user with the ID : ${userid}`);
            }
        });
};

export const generateEmailLink = (user: User) => {
    const secret = `${user.email}${keys.accessTokenKey}`;

    const emailToken = generateOnetimeToken(user.id, secret);

    const emailLink = `localhost:4001/verification/email/${user.id}/${emailToken}`;
    return emailLink;
};

export const generatePasswordLink = (user: userWithAuthData) => {
    const secret = `${user.AuthenticationData[0].password}${keys.accessTokenKey}`;

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

export const isEmailVerified = async (email: string) => {};

export const isPhoneVerified = async (email: string) => {};
