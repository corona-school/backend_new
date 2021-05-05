import { Request, Response } from 'express';
import { logError, logInfo } from '../../services/logger';
import {
    addRole,
    checkUserAllowedFor,
    createTask,
    updateTaskLevel,
} from '../../services/dataStore';

export const newTask = async (req: Request, res: Response) => {
    logInfo(
        `Started:: newTask route with params  ${JSON.stringify(
            req.params,
            null,
            4
        )}`
    );

    const userId = (<any>req).user.userid._id;

    if (userId == null || userId == undefined) {
        logError('unable to get userID');
        res.status(404).send('Improper request');
        return false;
    }
    try {
        const userAllowed = await checkUserAllowedFor(userId, 'createTask');
        if (!userAllowed) {
            res.status(401).send(
                'User not authorised to perform this operation'
            );
            return false;
        }
        const task = req.body;
        const addedTask = await createTask(task);
        if (Object.keys(addedTask).length == 0) {
            res.status(200).send('Task Exists already');
            return false;
        }
        res.status(200).json(addedTask);
        return true;
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};

export const changeTaskLevel = async (req: Request, res: Response) => {
    logInfo(
        `Started:: newTask route with params  ${JSON.stringify(
            req.params,
            null,
            4
        )}`
    );

    const userId = (<any>req).user.userid._id;

    if (userId == null || userId == undefined) {
        logError('unable to get userID');
        res.status(404).send('Improper request');
        return false;
    }
    try {
        const userAllowed = await checkUserAllowedFor(
            userId,
            'changeTaskLevel'
        );
        if (!userAllowed) {
            res.status(401).send(
                'User not authorised to perform this operation'
            );
            return false;
        }
        const task = req.body;
        const updatedTask = await updateTaskLevel(task);
        if (Object.keys(updatedTask).length == 0) {
            res.status(400).send('Could not update Task');
            return false;
        }
        res.status(200).json(updatedTask);
        return true;
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};
