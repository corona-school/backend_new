import express from 'express';
import passport from 'passport';
import { signup, login, resetPassword } from '../controllers/authController';

export const authentication = (app: express.Application): void => {
    const authApi = express.Router();
    authApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    authApi.post('/signup', signup);
    authApi.post('/login', login);
    authApi.post(
        '/password_reset',
        passport.authenticate('jwt', { session: false }),
        resetPassword
    );

    app.use('/auth', authApi);
};
