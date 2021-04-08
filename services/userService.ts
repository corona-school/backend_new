import {
    findEmailToUser,
    findPhoneToUser,
    generateEmailLink,
    generatePhoneLink,
} from '../utils/helpers';
import { logError, logInfo } from './logger';

import { PrismaClient } from '@prisma/client';
import { verification } from '../mailjet/mailTemplates/verification';
import { test_sms } from '../mailjet/smsTemplates/test_sms';
const prisma = new PrismaClient();

interface IChangeEmail {
    userId: string;
    email: string;
}

interface IChangePhone {
    userId: string;
    phone: string;
}

export const emailChange = async ({ userId, email }: IChangeEmail) => {
    const getUserEmail = await findEmailToUser(userId);
    if (getUserEmail != null) {
        if (getUserEmail.email != email) {
            const updateEmail = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    email: email,
                    emailVerified: false,
                },
            });

            const emailLink = generateEmailLink(updateEmail);
            const updateEmailNoti = new verification(updateEmail.email, {
                subject: 'Verify your email address',
                firstname: updateEmail.firstName,
                verification_email: emailLink,
            });
            await updateEmailNoti.forced_send();

            /*sendNotification(updateEmail.email, {
                Subject: 'Verify your email address',
                Message: `Dear ${updateEmail.firstName},
                         Please verify your email address ${emailLink}`,
                HTMLContent: `<h3>Dear ${updateEmail.firstName},</br>
                         Please verify your email address using the following <a href=\"https://${emailLink}/\">link</a>!</h3><br /><h5>Best regards,
                         Team corona-school</h5!`,
            });
            */
            logInfo(`Email change link : ${emailLink}`);
            logInfo(`Email has been sent`);
            logInfo(`Email of the user ${updateEmail.id} has been updated`);
            return {
                message: 'Email has been updated',
            };
        } else {
            logError(`Email must be a different email`);
            throw new Error('Email must be a different email');
        }
    } else {
        logError(`Couldn't find any email for the userid: ${userId}`);
        throw new Error("Couldn't find any email for the user");
    }
};

export const phoneChange = async ({ userId, phone }: IChangePhone) => {
    const getUserPhone = await findPhoneToUser(userId);
    if (getUserPhone != null) {
        if (getUserPhone.phone != phone) {
            const phoneUpdate = await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    phone: phone,
                    phoneVerified: false,
                },
            });

            const link = generatePhoneLink(phoneUpdate);
            const phoneChangeNoti = new test_sms(
                phone,
                `Hello ${phoneUpdate.firstName}, Verify your phone number by clicking ${link}`
            );
            await phoneChangeNoti.forced_send();
            /*sendText(
                phone,
                `Hello ${phoneUpdate.firstName}, Verify your phone number by clicking ${link}`
            );*/

            logInfo(`Phone change link : ${link}`);
            logInfo(`Phone notification has been sent`);

            logInfo(
                `Phone number of the user ${phoneUpdate.id} has been updated`
            );
            return {
                message: 'Phone number has been updated',
            };
        } else {
            logError(`Phone number must be a different number`);
            throw new Error('Phone number must be a different number');
        }
    } else {
        logError(`Couldn't find any email for the userid: ${userId}`);
        throw new Error(`Couldn't find any email for the user`);
    }
};
