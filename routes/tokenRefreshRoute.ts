import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { signAccessToken, signRefreshToken } from '../utils/jwt_signature';
import { keys } from '../utils/secretKeys';
import { addRefreshToken, isRefreshTokenValid } from '../utils/helpers';
import { PrismaClient } from '.prisma/client';
import passport from 'passport';
import { logError, logInfo } from '../services/logger';

const prisma = new PrismaClient();

export const refreshToken = (app: express.Application): void => {
    const refreshTokenApi = express.Router();
    refreshTokenApi.get('/ping', (req, res) =>
        res.send('pong').status(200).end()
    );

    refreshTokenApi.post(
        '/',
        passport.authenticate('jwt', { session: false }),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { refreshToken } = req.body;
                const userid = (<any>req).user.userid._id;

                if (userid == null || userid == undefined) {
                    logError('Unable to get userID');
                    next(new Error('Unable to get userID'));
                }

                logInfo(
                    `Token refresh route started with the userid: ${userid}`
                );

                // Token cannot be empty or null
                if (!refreshToken) {
                    logError('Error occurred while getting refresh token');
                    next(new Error('Error occurred'));
                }

                if (!userid) {
                    logError('No userid supplied with the token');
                    next(new Error('Error occurred'));
                }

                /* Checking the token in conjection with userID, if its exist then we can
                further verifying it */

                let newAccessToken: string, newRefreshToken: string;

                const getUsertoken = await isRefreshTokenValid(userid);
                if (getUsertoken != null) {
                    if (
                        getUsertoken.token === refreshToken &&
                        getUsertoken.valid
                    ) {
                        // If true, refresh token matched with the userid
                        logInfo(`Token/User is valid`);

                        jwt.verify(
                            refreshToken,
                            keys.refreshTokenKey,
                            async (err: any, decoded: any) => {
                                if (err != null) {
                                    if (err.name === 'TokenExpiredError') {
                                        logError(
                                            'Whoops, your token has expired!'
                                        );
                                        next(new Error(err.message));
                                    }

                                    if (err.name === 'JsonWebTokenError') {
                                        logError('That JWT is invalid!');
                                        next(new Error(err.message));
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

                                /*We need to delete all token of the specific user(user_id) or make it false in the DB and add a new refresh token with valid == true*/
                                await prisma.refreshToken.deleteMany({
                                    where: {
                                        userId: {
                                            equals: decoded.userid._id,
                                        },
                                    },
                                });

                                addRefreshToken(
                                    decoded.userid._id,
                                    newRefreshToken
                                ).then((data) => {
                                    res.send({
                                        accessToken: newAccessToken,
                                        refreshToken: newRefreshToken,
                                    });
                                });
                            }
                        );
                    } else {
                        logError('Token/User is not valid');
                        next(new Error('Token/User is not valid'));
                    }
                } else {
                    logError('No user with the given userid');
                    next(new Error('Error occurred while getting user token'));
                }
            } catch (error) {
                next(new Error(error.message));
            }
        }
    );

    app.use('/token_refresh', refreshTokenApi);
};
