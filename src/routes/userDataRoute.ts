import express from 'express';
import passport from 'passport';
import {
    changeEmail,
    changePhone,
    updateUserData,
    userDataDelete,
} from '../controllers/userDataController';

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
    userDataApi.post(
        '/delete',
        passport.authenticate('jwt', { session: false }),
        userDataDelete
    );
    userDataApi.post(
        '/save',
        passport.authenticate('jwt', { session: false }),
        updateUserData
    );

    app.use('/user', userDataApi);
};
