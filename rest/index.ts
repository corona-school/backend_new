import express from 'express';

export const ConfigureREST = (app: express.Application): void => {
    const restApi = express.Router();
    restApi.get('/ping', (req, res) => res.send('pong').status(200).end());
    app.use('/rest', restApi);
};
