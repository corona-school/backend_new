import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logError, logInfo } from '../../services/logger';
import {
    forgotSchema,
    resetPasswordSchema,
} from '../../utils/validationSchema';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { signForgotToken } from '../../utils/jwt_signature';
import jwt from 'jsonwebtoken';
import { sendResetNotification } from '../../services/notification';
import { keys } from '../../utils/secretKeys';

const prisma = new PrismaClient();

export const ResetPassword = (app: express.Application): void => {
    const forgotApi = express.Router();
    forgotApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    forgotApi.post(
        '/forgot',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response, next: NextFunction) => {
            logInfo(`Forgot password route begin`);

            const { error, value } = forgotSchema.validate(
                req.body,
                _validationOptions
            );
            const { email } = value;

            if (error) {
                logError('Invalid email');
                next(new Error(error.message));
            } else {
                await prisma.user
                    .findUnique({
                        where: {
                            email: email,
                        },
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            AuthenticationData: {
                                select: {
                                    password: true,
                                },
                            },
                        },
                    })
                    .then((user) => {
                        if (user == null) {
                            next(new Error('Email not registered'));
                        } else {
                            const secret = `${user.AuthenticationData[0].password}${keys.accessTokenKey}`;

                            const forgotToken = signForgotToken(
                                user.id,
                                secret
                            );

                            const link = `https://localhost:4001/forgot-password/${user.id}/${forgotToken}`;

                            logInfo(`Forgot password one-time token generated`);
                            logInfo(`Email link is created ${link}`);

                            // sendResetNotification(
                            //     {
                            //         email: user.email,
                            //         firstName: user.firstName,
                            //     },
                            //     {
                            //         Subject: 'Reset password',
                            //         Message: `Hello ${user.firstName} Here is your one-time token for your password reset${link}`,
                            //     }
                            // );

                            return res.json({ link });
                        }
                    })
                    .catch((err) => {
                        next(new Error(err.message));
                    });
            }
        }
    );

    forgotApi.post(
        '/:userId/:token',
        async (req: Request, res: Response, next: NextFunction) => {
            logInfo(
                `Reset password route begin with following params ${req.params}`
            );
            try {
                const { userId, token } = req.params;
                const { error, value } = resetPasswordSchema.validate(
                    req.body,
                    _validationOptions
                );
                const { password } = value;

                if (error) {
                    next(new Error(error.message));
                } else {
                    await prisma.user
                        .findUnique({
                            where: {
                                id: userId,
                            },
                            include: {
                                AuthenticationData: {
                                    select: {
                                        id: true,
                                        password: true,
                                    },
                                },
                            },
                        })
                        .then((user) => {
                            if (user != null) {
                                const secret = `${user.AuthenticationData[0].password}${keys.accessTokenKey}`;
                                const token__ = jwt.verify(token, secret);

                                if (token__) {
                                    logInfo(
                                        `Reset token verified for the user ${userId}`
                                    );
                                    return {
                                        user,
                                        isPasswordMatch: bcrypt.compareSync(
                                            password,
                                            user.AuthenticationData[0].password
                                        ),
                                    };
                                } else if (token__ == '') {
                                    logError(`Reset token expires`);
                                    next(
                                        new Error('Invalid token/token expires')
                                    );
                                } else {
                                    logError(`Reset token expires`);
                                    next(new Error('Invalid token'));
                                }
                            } else {
                                logError(`User not found`);
                                next(new Error('User not found'));
                            }
                        })
                        .then(async (obj) => {
                            if (obj) {
                                if (!obj.isPasswordMatch) {
                                    await bcrypt.genSalt(10, (err, salt) => {
                                        return bcrypt.hash(
                                            password,
                                            salt,
                                            async (err, hash) => {
                                                if (err) throw err;

                                                await prisma.authenticationData
                                                    .update({
                                                        where: {
                                                            id:
                                                                obj.user
                                                                    .AuthenticationData[0]
                                                                    .id,
                                                        },
                                                        data: {
                                                            password: hash,
                                                        },
                                                    })
                                                    .then((done) => {
                                                        logInfo(
                                                            `User password has been updated`
                                                        );
                                                        res.json({
                                                            msg:
                                                                'User password has been updated',
                                                        });
                                                    });
                                            }
                                        );
                                    });
                                } else {
                                    next(
                                        new Error(
                                            'New password cannot be an old password'
                                        )
                                    );
                                }
                            }
                        })
                        .catch((err) => {
                            next(new Error('Invalid token/token expires'));
                        });
                }
            } catch (error) {
                next(new Error(error.message));
            }
        }
    );

    // Joi validation options
    const _validationOptions = {
        abortEarly: false, // abort after the last validation error
        allowUnknown: true, // allow unknown keys that will be ignored
        stripUnknown: true, // remove unknown keys from the validated data
    };

    app.use('/forgot-password', forgotApi);
};
