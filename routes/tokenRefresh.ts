import express from 'express';
import passport from 'passport';
import { refreshToken } from '../controllers/tokenController';

export const token = (app: express.Application): void => {
    const refreshTokenApi = express.Router();
    refreshTokenApi.get('/ping', (req, res) =>
        res.send('pong').status(200).end()
    );

    refreshTokenApi.post(
        '/',
        passport.authenticate('jwt', { session: false }),
        refreshToken
    );

    app.use('/token_refresh', refreshTokenApi);
};
