import { Request, Response, NextFunction } from 'express';
import { logError, logInfo } from '../../../services/logger';
import {
    findEmailToUser,
    findPhoneToUser,
    generateEmailLink,
    generatePhoneLink,
} from '../utils/helpers';
import { emailSchema } from '../utils/validationSchema';
import { sendNotification, sendText } from '../../../services/notification';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const changeEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
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

    if (userid == null || userid == undefined) {
        logError('unable to get userID');
        next(new Error('unable to get userID'));
    }

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
                        .then((user) => {
                            // Send email verification link
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
                            logError(`Error occured in updating user email`);
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
            logError(`No registered user with the given userID`);
            next(new Error('Something went wrong'));
        });
};

export const changePhone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Expecting phone number string
    const { phone } = req.body;

    if (!phone) {
        logError('Phone number not provided');
        next(new Error('Phone number cannot be empty'));
    }

    //getting the userid from auth middleware
    const userid = (<any>req).user.userid._id;

    if (userid == null || userid == undefined) {
        logError('unable to get userID');
        next(new Error('unable to get userID'));
    }

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
                            if (user != null) {
                                // Send phone verification link
                                const link = generatePhoneLink(user);
                                sendText(
                                    phone,
                                    `Hello ${user.firstName}, Verify your phone by clicking ${link}`
                                );

                                logInfo(
                                    `Phone number of the user ${user.id} has been updated`
                                );
                                res.json({
                                    message: 'Phone number has been updated',
                                });
                            }
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
                    next(new Error('Phone number must be a different number'));
                }
            }
        })
        .catch((err) => {
            logError(`No registered user with the given userID`);
            next(new Error('Something went wrong'));
        });
};
