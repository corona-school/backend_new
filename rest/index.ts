import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';

export const ConfigureREST = (app: express.Application): void => {
    const restApi = express.Router();
    restApi.get('/ping', (req, res) => res.send('pong').status(200).end());

    app.use('/rest', restApi);
};
