import { PrismaClient } from '@prisma/client';
import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { logError, logInfo } from '../../services/logger';
import { findEmailToUser, generateEmailLink } from '../../utils/helpers';
import { keys } from '../../utils/secretKeys';
import { emailSchema } from '../../utils/validationSchema';
import jwt from 'jsonwebtoken';
import { sendNotification } from '../../services/notification';

const prisma = new PrismaClient();

export const emailsVerification = (app: express.Application): void => {
    const emailsVerificationApi = express.Router();
    emailsVerificationApi.get('/ping', (req, res) =>
        res.send('pong').status(200).end()
    );

    emailsVerificationApi.post(
        '/change-email',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response, next: NextFunction) => {
            const { error, value } = emailSchema.validate(req.body);
            const { email } = value;

            if (error) {
                logError('Invalid email');
                next(new Error(error.message));
            }

            if (!email) {
                logError('Email not provided');
                next(new Error('Email cannot be empty'));
            }
            // Change email
            const userid = (<any>req).user.userid._id;

            const isEmailSame = findEmailToUser(userid);
            isEmailSame
                .then(async (data) => {
                    if (data != null) {
                        if (data.email != email) {
                            await prisma.user
                                .update({
                                    where: {
                                        id: userid,
                                    },
                                    data: {
                                        email: email,
                                        emailVerified: false,
                                    },
                                })
                                .then((result) => {
                                    // Send email verification link
                                    const user = result;

                                    const emailLink = generateEmailLink(user);

                                    sendNotification(
                                        user.email,

                                        {
                                            Subject:
                                                'Verify your email address',
                                            Message: `Dear ${user.firstName},
                                            Please verify your email address ${emailLink}`,
                                            HTMLContent: `<h3>Dear ${user.firstName},</br> 
                                            Please verify your email address using the following <a href=\"https://${emailLink}/\">link</a>!</h3><br /><h5>Best regards,
                                            Team corona-school</h5!`,
                                        }
                                    );

                                    logInfo(`One time token generated`);
                                    logInfo(
                                        `Email change link is created ${emailLink}`
                                    );
                                    logInfo(
                                        `Email of the user ${user.id} has been updated`
                                    );
                                    res.json({
                                        message: 'Email has been updated',
                                    });
                                })
                                .catch((err) => {
                                    logError(
                                        `Error occured in updating user email`
                                    );
                                    next(
                                        new Error(
                                            'Error occured in updating user email'
                                        )
                                    );
                                });
                        } else {
                            logError(`Email must be a different email`);
                            next(new Error('Email must be a different email'));
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    );

    emailsVerificationApi.post(
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
                            email: true,
                        },
                    })
                    .then((result) => {
                        if (result != null) {
                            const secret = `${result.email}${keys.accessTokenKey}`;

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
                                                emailVerified: true,
                                            },
                                        });

                                        res.json({
                                            message: 'Email is verified',
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

    app.use('/email', emailsVerificationApi);
};
