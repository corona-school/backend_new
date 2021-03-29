import { Request, Response, NextFunction } from 'express';
import {
    findEmailToUser,
    findPhoneToUser,
    generateEmailLink,
    generatePhoneLink,
} from '../../utils/helpers';
import { emailSchema } from '../../utils/validationSchema';

import { PrismaClient } from '@prisma/client';
import { logError, logInfo } from '../../services/logger';
import { sendNotification, sendText } from '../../services/notification';
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

    const getUserEmail = await findEmailToUser(userid);
    if (getUserEmail != null) {
        if (getUserEmail.email != email) {
            const updateEmail = await prisma.user.update({
                where: {
                    id: userid,
                },
                data: {
                    email: email,
                    emailVerified: false,
                },
            });

            const emailLink = generateEmailLink(updateEmail);

            sendNotification(updateEmail.email, {
                Subject: 'Verify your email address',
                Message: `Dear ${updateEmail.firstName},
                         Please verify your email address ${emailLink}`,
                HTMLContent: `<h3>Dear ${updateEmail.firstName},</br>
                         Please verify your email address using the following <a href=\"https://${emailLink}/\">link</a>!</h3><br /><h5>Best regards,
                         Team corona-school</h5!`,
            });

            logInfo(`Email change link is created ${emailLink}`);
            logInfo(`Email of the user ${updateEmail.id} has been updated`);
            res.json({
                message: 'Email has been updated',
            });
        } else {
            logError(`Email must be a different email`);
            next(new Error('Email must be a different email'));
        }
    } else {
        logError(`Couldn't find any email for the userid: ${userid}`);
        next(new Error("Couldn't find any email for the user"));
    }
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

    logError(`Couldn't find any user with the ID : ${userid}`);
    const getUserPhone = await findPhoneToUser(userid);

    if (getUserPhone != null) {
        if (getUserPhone.phone != phone) {
            const phoneUpdate = await prisma.user.update({
                where: {
                    id: userid,
                },
                data: {
                    phone: phone,
                    phoneVerified: false,
                },
            });

            const link = generatePhoneLink(phoneUpdate);
            sendText(
                phone,
                `Hello ${phoneUpdate.firstName}, Verify your phone by clicking ${link}`
            );

            logInfo(
                `Phone number of the user ${phoneUpdate.id} has been updated`
            );
            res.json({
                message: 'Phone number has been updated',
            });
        } else {
            logError(`Phone number must be a different number`);
            next(new Error('Phone number must be a different number'));
        }
    } else {
        logError(`Couldn't find any email for the userid: ${userid}`);
        next(new Error(`Couldn't find any email for the user`));
    }
};
