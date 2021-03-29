import express from 'express';
import passport from 'passport';
import { changeEmail, changePhone } from '../controllers/userDataController';

export const userdata = (app: express.Application): void => {
    const userDataApi = express.Router();
    userDataApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    userDataApi.post(
        '/change-email',
        passport.authenticate('jwt', { session: false }),
        changeEmail
    );
    userDataApi.post(
        '/change-phone',
        passport.authenticate('jwt', { session: false }),
        changePhone
    );

    app.use('/user', userDataApi);
};
