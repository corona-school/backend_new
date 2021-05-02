import express from 'express';
import passport from 'passport';
import { newTask } from '../controllers/tasksController';

export const tasks = (app: express.Application): void => {
    const tasksRoute = express.Router();
    tasksRoute.get('/ping', (req, res) => res.send('pong').status(200).end());
    tasksRoute.post(
        '/new',
        passport.authenticate('jwt', { session: false }),
        newTask
    );
    app.use('/tasks', tasksRoute);
};
