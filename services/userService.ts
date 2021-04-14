import {
    findEmailToUser,
    findPhoneToUser,
    findUserByEmail,
    findUserById,
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
    let transactionArray = [];

    if (user != null && AuthData != null && user.phone != null) {
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

        const deleteRefreshTokens = prisma.refreshToken.deleteMany({
            where: {
                authId: AuthData.id,
            },
        });

        const deleteAuthData = prisma.authenticationData.deleteMany({
            where: {
                userId: userId,
            },
        });

        const deleteEmailData = prisma.emailNotifications.deleteMany({
            where: {
                recipientEmail: user.email,
            },
        });

        const deleteUser = prisma.user.delete({
            where: {
                id: userId,
            },
        });

        // we are using above user.phone != null because we don't need phone while registering the user, and if user wants to delete his/her account before completing his data(phone) we need that null otherwise below query expecting a string value over a null value from DB
        const deleteTextData = prisma.textNotifications.deleteMany({
            where: {
                recipientPhone: user.phone,
            },
        });

        transactionArray = [
            deletePupilData,
            deleteVolunteerData,
            deleteEmailData,
            deleteTextData,
            deleteRefreshTokens,
            deleteAuthData,
            deleteUser,
        ];

        await prisma.$transaction(transactionArray);

        logInfo(`Delete transaction has been completed`);
        logInfo(`User ${user.id} has been deleted`);
        return {
            message: `User ${user.id} has been deleted`,
        };
    } else {
        logError('No user found');
        throw new Error('No user found');
    }
};

export const userUpdate = async (userData: any, userId: string) => {
    const dataKeys: string[] = Object.keys(userData);
    const findUser: User | null = await findUserById(userId);

    if (findUser != null) {
        const userUpdate = await prisma.user.update({
            where: {
                id: findUser.id,
            },
            data: userData,
        });

        if (dataKeys.includes('email')) {
            if (findUser.email != userData['email']) {
                logInfo('Sending verification email yo updated email');

                await prisma.user.update({
                    where: {
                        id: userUpdate.id,
                    },
                    data: {
                        emailVerified: false,
                    },
                });

                const emailLink = generateEmailLink(userUpdate);
                const verificationEmail = new verification(userData['email'], {
                    subject: 'Verify your email address',
                    firstname: userUpdate.firstName,
                    verification_email: emailLink,
                });

                await verificationEmail.forced_send();
            }
        }

        if (dataKeys.includes('phone')) {
            if (findUser.phone != userData['phone']) {
                logInfo('Sending verification message yo updated phone');
                await prisma.user.update({
                    where: {
                        id: userUpdate.id,
                    },
                    data: {
                        phoneVerified: false,
                    },
                });

                const link = generatePhoneLink(userUpdate);
                const phoneChangeNotification = new sms(
                    userData['phone'],
                    `Hello ${userUpdate.firstName}, Verify your phone number by clicking \n ${link}`
                );
                await phoneChangeNotification.forced_send();
            }
        }

        return {
            data: userUpdate.id,
            message: 'User data has been updated',
        };
    } else {
        logError('No User found');
        throw new Error('No user found');
    }
};

export const userRegister = async (userData: any, userEmail: string) => {
    const findUser: User | null = await findUserByEmail(userEmail);

    if (findUser == null) {
        //No user in our record, create a new user
        const createUser = await prisma.user.create({
            data: userData,
        });

        return createUser;
    } else {
        logError(`${findUser.email} already exists`);
        throw new Error('User email already exists');
    }
};
