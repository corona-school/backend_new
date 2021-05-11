import express from 'express';
import passport from 'passport';
import { changeTaskLevel, newTask } from '../controllers/tasksController';

export const tasks = (app: express.Application): void => {
    const tasksRoute = express.Router();
    tasksRoute.get('/ping', (req, res) => res.send('pong').status(200).end());
    tasksRoute.post(
        '/new',
        passport.authenticate('jwt', { session: false }),
        newTask
    );
    tasksRoute.post(
        '/changeLevel',
        passport.authenticate('jwt', { session: false }),
        changeTaskLevel
    );
    app.use('/tasks', tasksRoute);
};
