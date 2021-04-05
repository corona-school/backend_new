import {
    addRefreshToken,
    getUserAuthData,
    isRefreshTokenValid,
} from '../utils/helpers';
import { signAccessToken, signRefreshToken } from '../utils/jwt_signature';
import { keys } from '../utils/secretKeys';
import { logError, logInfo } from './logger';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IRToken {
    userId: string;
    refreshToken: string;
}

export const tokenRefresh = async ({ userId, refreshToken }: IRToken) => {
    // Token cannot be empty or null
    if (!refreshToken) {
        logError('Error occurred while getting refresh token');
        throw new Error('Error occurred');
    }

    if (!userId) {
        logError('No userid supplied with the token');
        throw new Error('Error occurred');
    }

    /* Checking the token in conjection with userID, if its exist then we can
        further verifying it */

    let newAccessToken: string, newRefreshToken: string;
    const authData = await getUserAuthData(userId);

    if (authData != null) {
        const getUsertoken = await isRefreshTokenValid(authData.id);

        if (getUsertoken != null) {
            if (getUsertoken.token === refreshToken && getUsertoken.valid) {
                // If true, refresh token matched with the userid
                logInfo(`Token/User is valid`);

                return jwt.verify(
                    refreshToken,
                    keys.refreshTokenKey,
                    async (err: any, decoded: any) => {
                        if (err != null) {
                            if (err.name === 'TokenExpiredError') {
                                logError('Whoops, your token has expired!');
                                throw new Error(err.message);
                            }

                            if (err.name === 'JsonWebTokenError') {
                                logError('That JWT is invalid!');
                                throw new Error(err.message);
                            }
                        }

                        newAccessToken = signAccessToken(
                            decoded.userid._id,
                            keys.accessTokenKey
                        );
                        newRefreshToken = signRefreshToken(
                            decoded.userid._id,
                            keys.refreshTokenKey
                        );

                        /*We need to make the provided token false for the specific user(based on auth ID)*/

                        await prisma.refreshToken.update({
                            where: {
                                id: getUsertoken.id,
                            },
                            data: {
                                valid: false,
                            },
                        });

                        return addRefreshToken(
                            authData.id,
                            newRefreshToken
                        ).then((data) => {
                            return {
                                message: 'New tokens generated',
                                accessToken: newAccessToken,
                                refreshToken: newRefreshToken,
                            };
                        });
                    }
                );
            } else {
                logError('Token/User is not valid');
                throw new Error('Token/User is not valid');
            }
        } else {
            logError('No valid tokens');
            throw new Error('Error occurred while getting tokens');
        }
    } else {
        logError('No user with the given userid');
        throw new Error('Error occurred while getting user token');
    }
};
