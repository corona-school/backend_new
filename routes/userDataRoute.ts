import express from 'express';
import passport from 'passport';
import {
    changeEmail,
    changePhone,
    courseCreate_,
    courseDeactivate,
    createOffer,
    match_,
    pupil,
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

    userDataApi.post(
        '/course-create',
        passport.authenticate('jwt', { session: false }),
        courseCreate_
    );
    userDataApi.post(
        '/course-deactivate',
        passport.authenticate('jwt', { session: false }),
        courseDeactivate
    );
    userDataApi.post(
        '/create-offer',
        passport.authenticate('jwt', { session: false }),
        createOffer
    );

    userDataApi.post(
        '/pupil',
        passport.authenticate('jwt', { session: false }),
        pupil
    );

    userDataApi.post(
        '/match',
        passport.authenticate('jwt', { session: false }),
        match_
    );

    app.use('/user', userDataApi);
};
