import { PrismaClient } from '@prisma/client';
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
import { sendNotification } from './notification';
import { signAccessToken, signRefreshToken } from '../utils/jwt_signature';
import { keys } from '../utils/secretKeys';

const prisma = new PrismaClient();

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

export const registerUser = async ({
    firstName,
    email,
    password,
}: IRegister) => {
    const user = await findUserByEmail(email);
    if (user == null) {
        const createUser = await prisma.user.create({
            data: {
                firstName,
                email,
            },
        });

        if (createUser != null) {
            let saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);

            await prisma.authenticationData.create({
                data: {
                    password: hash,
                    user: {
                        connect: {
                            id: createUser.id,
                        },
                    },
                },
            });

            logInfo(`${createUser.email} has been registered`);
            const emailLink = generateEmailLink(createUser);

            sendNotification(
                createUser.email,

                {
                    Subject: 'Verify your email address',
                    Message: `Dear ${createUser.firstName},
                                    Please verify your email address ${emailLink}`,
                    HTMLContent: `<h3>Dear ${createUser.firstName},</br>
                                        Please verify your email address using the following <a href=\"https://${emailLink}/\">link</a>!</h3><br /><h5>Best regards,
                                        Team corona-school</h5!`,
                }
            );

            logInfo(`Verification link : ${emailLink}`);
            logInfo('Verification email has been sent to the user');

            return {
                data: createUser,
                message: 'User has been registered',
            };
        } else {
            logError(`Error occured while creating a user`);
            throw new Error('Error occured while creating a user');
        }
    } else {
        logError(`${user.email} already exist`);
        throw new Error('User email already exist');
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

            sendNotification(user.email, {
                Subject: 'Reset your password',
                Message: `Dear ${user.firstName},
                                    Please click the following ${passwordResetlink} link to rest your account password`,
                HTMLContent: `<h3>Dear ${user.firstName},</br>
                                    Please click the following <a href=\"https://${passwordResetlink}/\"> link to reset your account password</a>!</h3><br /><h5>Best regards,
                                    Team corona-school</h5!`,
            });

            logInfo('Password reset link has been sent');

            return { resetLink: passwordResetlink };
        } else {
            logError(`No auth data found for the user ${user.email}`);
            throw new Error('Error occured while getting auth data');
        }
    }
};
