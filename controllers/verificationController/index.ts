import { Request, Response, NextFunction } from 'express';
import { logError, logInfo } from '../../services/logger';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { keys } from '../../utils/secretKeys';
import { passwordSchema } from '../../utils/validationSchema';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userid, token } = req.params;

        const user = await prisma.user.findUnique({
            where: {
                id: userid,
            },
            select: {
                id: true,
                email: true,
            },
        });

        if (user != null) {
            const secret = `${user.email}${keys.accessTokenKey}`;

            jwt.verify(token, secret, async (err: any, decoded: any) => {
                if (err != null) {
                    if (err.name === 'TokenExpiredError') {
                        logError('Whoops, your token has expired!');
                        next(new Error(err.message));
                    }

                    if (err.name === 'JsonWebTokenError') {
                        logError('That JWT is invalid!');
                        next(new Error(err.message));
                    }
                } else {
                    await prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            emailVerified: true,
                        },
                    });

                    res.json({
                        message: 'Email is verified',
                    });
                }
            });
        } else {
            logError(`User not found`);
            next(new Error('User not found'));
        }
    } catch (error) {
        logError(`Error occurred : ${error}`);
        next(new Error(`Error occurred : ${error}`));
    }
};

export const verifyPhone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userid, token } = req.params;

        const user = await prisma.user.findUnique({
            where: {
                id: userid,
            },
            select: {
                id: true,
                phone: true,
            },
        });

        if (user != null) {
            const secret = `${user.phone}${keys.accessTokenKey}`;

            jwt.verify(token, secret, async (err: any, decoded: any) => {
                if (err != null) {
                    if (err.name === 'TokenExpiredError') {
                        logError('Whoops, your token has expired!');
                        next(new Error(err.message));
                    }

                    if (err.name === 'JsonWebTokenError') {
                        logError('That JWT is invalid!');
                        next(new Error(err.message));
                    }
                } else {
                    await prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            phoneVerified: true,
                        },
                    });

                    res.json({
                        message: 'Phone number is verified',
                    });
                }
            });
        } else {
            logError(`User not found`);
            next(new Error('User not found'));
        }
    } catch (error) {
        logError(`Error occurred : ${error}`);
        next(new Error(`Error occurred : ${error}`));
    }
};

export const verifyResetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logInfo(`Reset password route begin with following params ${req.params}`);
    try {
        const { userid, token } = req.params;
        const { error, value } = passwordSchema.validate(req.body);
        const { password } = value;

        if (error) {
            next(new Error(error.message));
        } else {
            const getUserPassword = await prisma.authenticationData.findUnique({
                where: {
                    id: userid,
                },
                select: {
                    password: true,
                },
            });

            if (getUserPassword != null) {
                const secret = `${getUserPassword.password}${keys.accessTokenKey}`;
                jwt.verify(token, secret, (err: any, decoded: any) => {
                    if (err != null) {
                        if (err.name === 'TokenExpiredError') {
                            logError('Whoops, your token has expired!');
                            next(new Error(err.message));
                        }

                        if (err.name === 'JsonWebTokenError') {
                            logError('That JWT is invalid!');
                            next(new Error(err.message));
                        }
                    }

                    logInfo(`Reset token verified for the user ${userid}`);
                    let isPasswordMatch = bcrypt.compareSync(
                        password,
                        getUserPassword.password
                    );
                    // New password must be different from old password
                    if (!isPasswordMatch) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(password, salt, async (err, hash) => {
                                if (err) throw err;

                                await prisma.authenticationData.update({
                                    where: {
                                        userId: userid,
                                    },
                                    data: {
                                        password: hash,
                                    },
                                });

                                logInfo(
                                    `Password has been updated for the user ${userid}`
                                );
                                res.json({
                                    msg: `Password has been updated for the user ${userid}`,
                                });
                            });
                        });
                    } else {
                        logError('New password cannot be an old password');
                        next(
                            new Error('New password cannot be an old password')
                        );
                    }
                });
            } else {
                logError(`User not found`);
                next(new Error('User not found'));
            }
        }
    } catch (error) {
        next(new Error(error.message));
    }
};
