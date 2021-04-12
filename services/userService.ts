import {
    findEmailToUser,
    findPhoneToUser,
    findUserByEmail,
    generateEmailLink,
    generatePhoneLink,
    getUserAuthData,
} from '../utils/helpers';
import { logError, logInfo } from './logger';

import { PrismaClient, User } from '@prisma/client';
import { verification } from '../mailjet/mailTemplates/verification';
import { sms } from '../mailjet/smsTemplates/sms';
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
            const updateEmailNotification = new verification(
                updateEmail.email,
                {
                    subject: 'Verify your email address',
                    firstname: updateEmail.firstName,
                    verification_email: emailLink,
                }
            );
            await updateEmailNotification.forced_send();

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
            const phoneChangeNotification = new sms(
                phone,
                `Hello ${phoneUpdate.firstName}, Verify your phone number by clicking ${link}`
            );
            await phoneChangeNotification.forced_send();

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

export const deleteUserData = async ({ userId }: any) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    const AuthData = await getUserAuthData(userId);

    if (user != null && AuthData) {
        if (user.phone != null) {
            const deletePupilData = prisma.pupil.deleteMany({
                where: {
                    userId: userId,
                },
            });

            const deleteVolunteerData = prisma.volunteer.deleteMany({
                where: {
                    userId: userId,
                },
            });

            const deleteAuthData = prisma.authenticationData.deleteMany({
                where: {
                    userId: userId,
                },
            });

            const deleteRefreshTokens = prisma.refreshToken.deleteMany({
                where: {
                    authId: AuthData.id,
                },
            });

            const deleteEmailData = prisma.emailNotifications.deleteMany({
                where: {
                    recipientEmail: user.email,
                },
            });

            // we are using above user.phone != null because we don't need phone while registering the user, and if user wants to delete his/her account before completing his data(phone) we need that null otherwise below query expecting a string value over a null value from DB
            const deleteTextData = prisma.textNotifications.deleteMany({
                where: {
                    recipientPhone: user.phone,
                },
            });

            const deleteUser = prisma.user.delete({
                where: {
                    id: userId,
                },
            });

            const transaction = await prisma.$transaction([
                deletePupilData,
                deleteVolunteerData,
                deleteEmailData,
                deleteTextData,
                deleteAuthData,
                deleteRefreshTokens,
                deleteUser,
            ]);

            logInfo(`Delete transaction has been completed: ${transaction}`);
            logInfo(`User ${user.email} has been deleted`);
            return {
                message: `User ${user.email} has been deleted`,
            };
        }
    } else {
        logError('No user found');
        throw new Error('No user found');
    }
};

export const userRegister = async (userData: User) => {
    const findUser = await findUserByEmail(userData.email);
    if (findUser == null) {
        //No user in our record, create a new user
        const createUser = await prisma.user.create({
            data: userData,
        });

        console.log('====', createUser);
    }
};
