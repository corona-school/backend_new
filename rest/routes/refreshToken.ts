import express, { Request, Response, NextFunction } from 'express';
import { logError } from '../../services/logger';
import jwt from 'jsonwebtoken';
import { signAccessToken, signRefreshToken } from '../../utils/jwt_signature';
import { keys } from '..//../utils/secretKeys';

export const refreshToken = (app: express.Application): void => {
    const refreshTokenApi = express.Router();
    refreshTokenApi.get('/ping', (req, res) =>
        res.send('pong').status(200).end()
    );

    refreshTokenApi.post(
        '/',
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    logError('Error occurred while getting refresh token');
                    throw new Error('Error occurred');
                }

                let newAccessToken, newRefreshToken;

                jwt.verify(
                    refreshToken,
                    keys.refreshTokenKey,
                    (err: any, decoded: any) => {
                        if (err) {
                            next(new Error(err.message));
                        }

                        newAccessToken = signAccessToken(
                            decoded.userid._id,
                            keys.accessTokenKey
                        );
                        newRefreshToken = signRefreshToken(
                            decoded.userid._id,
                            keys.refreshTokenKey
                        );

                        res.send({
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        });
                    }
                );
            } catch (error) {}
        }
    );

    app.use('/refresh-token', refreshTokenApi);
};
