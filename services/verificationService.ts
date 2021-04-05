import { PrismaClient } from '@prisma/client';
import { keys } from '../utils/secretKeys';
import jwt from 'jsonwebtoken';
import { logError, logInfo } from './logger';
import bcrypt from 'bcrypt';
import { getUserAuthData } from '../utils/helpers';

const prisma = new PrismaClient();

interface IVerify {
    userId: string;
    token: string;
}

interface IVerifyPassword {
    userId: string;
    token: string;
    password: string;
}

export const emailVerify = async ({ userId, token }: IVerify) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
        },
    });

    if (user != null) {
        const secret = `${user.email}${keys.accessTokenKey}`;

        logInfo(`Verifying the token...`);
        return jwt.verify(token, secret, async (err: any, decoded: any) => {
            if (err != null) {
                if (err.name === 'TokenExpiredError') {
                    logError('Whoops, your token has expired!');
                    throw new Error(err.message);
                }

                if (err.name === 'JsonWebTokenError') {
                    logError('That JWT is invalid!');
                    throw new Error(err.message);
                }
            } else {
                const updatedEmail = await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        emailVerified: true,
                    },
                });

                logInfo(`Email is verified for the user ${user.email}`);

                return {
                    data: updatedEmail,
                    message: 'Email is verified',
                };
            }
        });
    } else {
        logError(`User not found`);
        throw new Error('User not found');
    }
};

export const phoneVerify = async ({ userId, token }: IVerify) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            phone: true,
        },
    });

    if (user != null) {
        const secret = `${user.phone}${keys.accessTokenKey}`;

        logInfo(`Verifying the token...`);
        return jwt.verify(token, secret, async (err: any, decoded: any) => {
            if (err != null) {
                if (err.name === 'TokenExpiredError') {
                    logError('Whoops, your token has expired!');
                    throw new Error(err.message);
                }

                if (err.name === 'JsonWebTokenError') {
                    logError('That JWT is invalid!');
                    throw new Error(err.message);
                }
            } else {
                const updatedPhone = await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        phoneVerified: true,
                    },
                });

                logInfo(`Phone is verified for the user ${user.id}`);

                return {
                    data: updatedPhone,
                    message: 'Phone number is verified',
                };
            }
        });
    } else {
        logError(`User not found`);
        throw new Error('User not found');
    }
};

export const resetPasswordVerify = async ({
    userId,
    token,
    password,
}: IVerifyPassword) => {
    const authData = await getUserAuthData(userId);

    if (authData != null) {
        const secret = `${authData.password}${keys.accessTokenKey}`;
        return jwt.verify(token, secret, (err: any, decoded: any) => {
            if (err != null) {
                if (err.name === 'TokenExpiredError') {
                    logError('Whoops, your token has expired!');
                    throw new Error(err.message);
                }

                if (err.name === 'JsonWebTokenError') {
                    logError('That JWT is invalid!');
                    throw new Error(err.message);
                }
            }

            logInfo(`Reset token verified for the user ${userId}`);
            let isPasswordMatch = bcrypt.compareSync(
                password,
                authData.password
            );
            // New password must be different from old password
            if (!isPasswordMatch) {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, async (err, hash) => {
                        if (err) throw err;

                        const updatedPass = await prisma.authenticationData.update(
                            {
                                where: {
                                    id: authData.id,
                                },
                                data: {
                                    password: hash,
                                },
                            }
                        );

                        logInfo(
                            `Password has been updated for the user ${userId}`
                        );
                        return {
                            data: updatedPass,
                            message: `Password has been updated for the user ${userId}`,
                        };
                    });
                });
            } else {
                logError('New password cannot be an old password');
                throw new Error('New password cannot be an old password');
            }
        });
    } else {
        logError(`User not found`);
        throw new Error('User not found');
    }
};
