import bcrypt from 'bcrypt';
import { logError, logInfo } from './logger';
import {
    addRefreshToken,
    findUserByEmail,
    generateEmailLink,
    generatePasswordLink,
    getUserAuthData,
    isRefreshTokenValid,
} from '../utils/helpers';
import { signAccessToken, signRefreshToken } from '../utils/jwt_signature';
import { keys } from '../utils/secretKeys';
import { verificationEmail } from '../mailjet/mailTemplates/verificationEmail';
import { resetPasswordNotification } from '../mailjet/mailTemplates/resetPassword';
import { userRegister } from './userService';
import prisma from '../utils/prismaClient';
interface IRegister {
    firstName: string;
    lastName: string | null;
    email: string;
    password: string;
}
interface ILogin {
    email: string;
    password: string;
}

export const registerUser = async (registrationData: IRegister) => {
    const user = await userRegister(registrationData);
    if (user) {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(registrationData.password, salt);

        await prisma.authenticationData.create({
            data: {
                password: hash,
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        logInfo(`${user.email} has been registered`);
        const emailLink = generateEmailLink(user);

        const verificationEmailNotification = new verificationEmail(
            user.email,
            {
                subject: 'Verify your email address',
                firstname: user.firstName,
                verification_email: emailLink,
            }
        );

        try {
            await verificationEmailNotification.forced_send();
        } catch (e) {
            logError('Problem sending email. ' + e);
        }
        logInfo(`Verification link : ${emailLink}`);
        logInfo('Verification email has been sent to the user');

        return {
            data: user,
            message: 'User has been registered',
        };
    } else {
        logError(`Error occured while creating a user`);
        throw new Error('Error occured while creating a user');
    }
};

export const loginUser = async ({ email, password }: ILogin) => {
    const user = await findUserByEmail(email);
    if (user == null) {
        logError('User not found');
        return {
            message: 'Invalid email/password',
        };
    } else {
        const authData = await getUserAuthData(user.id);

        if (authData != null) {
            const isMatch = await bcrypt.compare(password, authData.password);
            if (isMatch) {
                const accessToken = signAccessToken(
                    user.id,
                    keys.accessTokenKey
                );

                // we will checking if we have referesh token associated with the userid and is valid
                const validToken = await isRefreshTokenValid(authData.id);

                if (validToken == null) {
                    const refreshToken = signRefreshToken(
                        user.id,
                        keys.refreshTokenKey
                    );
                    await addRefreshToken(authData.id, refreshToken);
                    logInfo('Logged in successfully');
                    return {
                        message: {
                            login: 'Successfull',
                            token: 'Refresh token added',
                        },
                        userId: user.id,
                        authId: authData.id,
                        accessToken,
                        refreshToken,
                    };
                } else {
                    logInfo('Current refresh token is still valid');
                    return {
                        message: 'Current refresh token is still valid',
                        accessToken,
                    };
                }
            } else {
                logError(`Password not matched`);
                return {
                    message: 'Invalid email/password',
                };
            }
        } else {
            logError(`No auth data found for the user ${user.email}`);
            throw new Error('Error occured while getting auth data');
        }
    }
};

export const passwordReset = async (email: string) => {
    const user = await findUserByEmail(email);
    if (user == null) {
        logError('Email not registered');
        throw new Error('Email not registered');
    } else {
        const authData = await getUserAuthData(user.id);
        if (authData != null) {
            // we are taking user password because after user changes his/her password
            // he/she will be unable to use that link again
            logInfo(`Forgot password one-time token generated`);
            const passwordResetlink = generatePasswordLink(user, authData);
            logInfo(`Password reset link: ${passwordResetlink}`);

            const resetNotification = new resetPasswordNotification(
                user.email,
                {
                    subject: 'Reset your password',
                    firstname: user.firstName,
                    verification_email: passwordResetlink,
                }
            );
            try {
                await resetNotification.forced_send();
            } catch (e) {
                logError('Problem sending email. ' + e);
            }
            logInfo('Password reset link has been sent');

            return { resetLink: passwordResetlink };
        } else {
            logError(`No auth data found for the user ${user.email}`);
            throw new Error('Error occured while getting auth data');
        }
    }
};
