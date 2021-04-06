import {
    addRefreshToken,
    getUserAuthData,
    isRefreshTokenValid,
} from '../utils/helpers';
import { signAccessToken, signRefreshToken } from '../utils/jwt_signature';
import { keys } from '../utils/secretKeys';
import { logError, logInfo } from './logger';
import jwt from 'jsonwebtoken';
import { PrismaClient, RefreshToken } from '@prisma/client';

const prisma = new PrismaClient();

interface IRToken {
    userId: string;
    refreshToken: string;
}

let newAccessToken: string, newRefreshToken: string;

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

                                logInfo(
                                    'Generating new pair of tokens after getting expired refresh token'
                                );
                                const getTokens = signTokens(authData.userId);
                                updateTokenToFalse(getUsertoken);

                                return addRefreshToken(
                                    authData.id,
                                    getTokens.refreshToken
                                ).then((data) => {
                                    return {
                                        message: 'New tokens generated',
                                        accessToken: getTokens.accessToken,
                                        refreshToken: getTokens.refreshToken,
                                    };
                                });
                            }

                            if (err.name === 'JsonWebTokenError') {
                                logError('That JWT is invalid!');
                                throw new Error(err.message);
                            }
                        }

                        logInfo('Generating new pair of tokens');
                        const getTokens = signTokens(decoded.userid._id);
                        updateTokenToFalse(getUsertoken);

                        return addRefreshToken(
                            authData.id,
                            getTokens.refreshToken
                        ).then((data) => {
                            return {
                                message: 'New tokens generated',
                                accessToken: getTokens.accessToken,
                                refreshToken: getTokens.refreshToken,
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

const signTokens = (userId: any) => {
    newAccessToken = signAccessToken(userId, keys.accessTokenKey);
    newRefreshToken = signRefreshToken(userId, keys.refreshTokenKey);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

const updateTokenToFalse = async (token: RefreshToken) => {
    /*We need to make the provided token false for the specific user(based on auth ID)*/
    // By this we can save already provied tokens in the DB for future use
    await prisma.refreshToken.update({
        where: {
            id: token.id,
        },
        data: {
            valid: false,
        },
    });
};
