import express from 'express';
import {
    verifyEmail,
    verifyPhone,
    verifyResetPassword,
} from '../controllers/verificationController';

export const verification = (app: express.Application): void => {
    const verifyApi = express.Router();
    verifyApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    verifyApi.post('/email/:userid/:token', verifyEmail);
    verifyApi.post('/phone/:userid/:token', verifyPhone);
    verifyApi.post('/password/:userid/:token', verifyResetPassword);

    app.use('/verification', verifyApi);
};
