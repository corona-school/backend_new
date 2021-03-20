import { Request, Response, NextFunction } from 'express';
import { logError, logInfo } from '../../../services/logger';
import {
    addRefreshToken,
    generateEmailLink,
    generatePasswordLink,
    isRefreshTokenValid,
} from '../utils/helpers';
import passport from 'passport';
import { signAccessToken, signRefreshToken } from '../utils/jwt_signature';
import { keys } from '../utils/secretKeys';
import { emailSchema, registerDataSchema } from '../utils/validationSchema';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendNotification } from '../../../services/notification';

const prisma = new PrismaClient();

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { error, value } = registerDataSchema.validate(req.body);
    const { firstName, lastName, email, password } = value;

    logInfo(
        `Register route initiated with params Name:${firstName} lastname:${lastName} email:${email}`
    );

    if (error) {
        logError(`${error.message}`);
        next(new Error(error.message));
    } else {
        try {
            //finding a user if already prsent in the db
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });

            if (user == null) {
                //creating a new user, generating salt and hash of password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, async (err, hash) => {
                        if (err) throw err;

                        await prisma.user
                            .create({
                                data: {
                                    firstName,
                                    lastName,
                                    email,
                                    AuthenticationData: {
                                        create: {
                                            password: hash,
                                        },
                                    },
                                },
                            })
                            .then((user) => {
                                logInfo(`${user.email} has been registered`);

                                const emailLink = generateEmailLink(user);

                                sendNotification(
                                    user.email,

                                    {
                                        Subject: 'Verify your email address',
                                        Message: `Dear ${user.firstName},
                                                    Please verify your email address ${emailLink}`,
                                        HTMLContent: `<h3>Dear ${user.firstName},</br> 
                                                        Please verify your email address using the following <a href=\"https://${emailLink}/\">link</a>!</h3><br /><h5>Best regards,
                                                        Team corona-school</h5!`,
                                    }
                                );

                                res.send({
                                    email: `${user.email}`,
                                    message: 'User has been registered',
                                });
                            });
                    });
                });
            } else {
                logError(`${user.email} already exist`);
                next(new Error('Email already exist'));
            }
        } catch (error) {
            next(new Error(error.message));
        }
    }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
    {
        passport.authenticate('login', async (err, user, info) => {
            try {
                if (err) {
                    logError('An error occurred while logging in the user');
                    return next(new Error('An error occurred'));
                }

                if (!user) {
                    logError(info.message);
                    return next(new Error('Invalid email/password'));
                } else {
                    logInfo(`Login route begin for the user ${user.id}`);
                    logInfo(`Logged in successfully`);
                    req.login(user, { session: false }, (err) => {
                        if (err) {
                            res.send(err);
                        }

                        const accessToken = signAccessToken(
                            user.id,
                            keys.accessTokenKey
                        );

                        const refreshToken = signRefreshToken(
                            user.id,
                            keys.refreshTokenKey
                        );

                        isRefreshTokenValid(user.id)
                            .then((data) => {
                                if (data != null) {
                                    // returns empty array if user login first time
                                    if (data.RefreshToken.length === 0) {
                                        // check if arr.length == 0 , if yes add a token in connjuction with userid
                                        return addRefreshToken(
                                            user.id,
                                            refreshToken
                                        );
                                    } else {
                                        // if its a second login, check the valid token in DB
                                        logInfo(
                                            'Current refresh token is still valid'
                                        );
                                        res.send({
                                            message:
                                                'Current refresh token is still valid',
                                            accessToken,
                                        });
                                    }
                                }
                            })
                            .then((response) => {
                                // getting the addRefreshToken response
                                if (response != null) {
                                    const userId = response.userId;
                                    const valid = response.valid;
                                    res.json({
                                        message:
                                            'Refresh token added in database',
                                        userId,
                                        valid,
                                        accessToken,
                                        refreshToken,
                                    });
                                }
                            });

                        logInfo(
                            `Login token generated for the user ${user.id}`
                        );
                    });
                }
            } catch (error) {
                return next(new Error(error.message));
            }
        })(req, res, next);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logInfo(`Forgot password route begin`);
    const { error, value } = emailSchema.validate(req.body);
    const { email } = value;

    if (error) {
        logError('Invalid email');
        next(new Error(error.message));
    } else {
        const user = await prisma.user.findUnique({
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
        });

        if (user == null) {
            next(new Error('Email not registered'));
        } else {
            logInfo(`Forgot password one-time token generated`);
            const passwordResetlink = generatePasswordLink(user);
            logInfo(`Email link is created ${passwordResetlink}`);

            sendNotification(user.email, {
                Subject: 'Reset your password',
                Message: `Dear ${user.firstName},
                                    Please click the following ${passwordResetlink} link to rest your account password`,
                HTMLContent: `<h3>Dear ${user.firstName},</br>
                                    Please click the following <a href=\"https://${passwordResetlink}/\"> link to reset your account password</a>!</h3><br /><h5>Best regards,
                                    Team corona-school</h5!`,
            });

            return res.json({ passwordResetlink });
        }
    }
};
