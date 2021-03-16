import { PrismaClient, User } from '@prisma/client';
import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { logError, logInfo } from '../../services/logger';
import { findPhoneToUser, generatePhoneLink } from '../../utils/helpers';
import { keys } from '../../utils/secretKeys';
import jwt from 'jsonwebtoken';
import { sendText } from '../../services/notification';

const prisma = new PrismaClient();

export const PhoneVerification = (app: express.Application): void => {
    const PhoneVerificationApi = express.Router();
    PhoneVerificationApi.get('/ping', (req, res) =>
        res.send('pong').status(200).end()
    );

    PhoneVerificationApi.post(
        '/change-phone',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response, next: NextFunction) => {
            // Expecting email string
            const { phone } = req.body;

            if (!phone) {
                logError('Phone number not provided');
                next(new Error('Phone number cannot be empty'));
            }
            // Change phone
            const userid = (<any>req).user.userid._id;
            console.log(userid);

            const isPhoneSame = findPhoneToUser(userid);
            isPhoneSame
                .then(async (data) => {
                    if (data != null) {
                        if (data.phone != phone) {
                            await prisma.user
                                .update({
                                    where: {
                                        id: userid,
                                    },
                                    data: {
                                        phone: phone,
                                        phoneVerified: false,
                                    },
                                })
                                .then((user) => {
                                    // Send email verification link
                                    const link = generatePhoneLink(user);

                                    // if (user.phone != null) {
                                    //     sendText(
                                    //         '+4917687984735',
                                    //         `Hello ${user.firstName}, Verify your phone by clicking ${link}`
                                    //     );
                                    // }

                                    logInfo(
                                        `Phone number of the user ${user.id} has been updated`
                                    );
                                    res.json({
                                        message:
                                            'Phone number has been updated',
                                    });
                                })
                                .catch((err) => {
                                    logError(
                                        `Error occured in updating user Phone number`
                                    );
                                    next(
                                        new Error(
                                            'Error occured in updating user Phone number'
                                        )
                                    );
                                });
                        } else {
                            logError(`Phone number must be a different number`);
                            next(
                                new Error(
                                    'Phone number must be a different number'
                                )
                            );
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    );

    PhoneVerificationApi.post(
        '/verify/:userid/:token',
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { userid, token } = req.params;

                await prisma.user
                    .findUnique({
                        where: {
                            id: userid,
                        },
                        select: {
                            id: true,
                            phone: true,
                        },
                    })
                    .then((result) => {
                        if (result != null) {
                            const secret = `${result.phone}${keys.accessTokenKey}`;

                            jwt.verify(
                                token,
                                secret,
                                async (err: any, decoded: any) => {
                                    if (err != null) {
                                        if (err.name === 'TokenExpiredError') {
                                            logError(
                                                'Whoops, your token has expired!'
                                            );
                                            next(new Error(err.message));
                                        }

                                        if (err.name === 'JsonWebTokenError') {
                                            logError('That JWT is invalid!');
                                            next(new Error(err.message));
                                        }
                                    } else {
                                        await prisma.user.update({
                                            where: {
                                                id: result.id,
                                            },
                                            data: {
                                                phoneVerified: true,
                                            },
                                        });

                                        res.json({
                                            message: 'Phone number is verified',
                                        });
                                    }
                                }
                            );
                        } else {
                            logError(`User not found`);
                            next(new Error('User not found'));
                        }
                    });
            } catch (error) {}
        }
    );

    app.use('/phone', PhoneVerificationApi);
};
