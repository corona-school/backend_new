import { logError, logInfo } from '../../services/logger';
import { Request, Response } from 'express';
import {
    addRole,
    assignRoleToUser,
    checkUserAllowedFor, deleteRoleForUser, updateRoleLevel, updateTaskLevel,
} from '../../services/dataStore';

export const newRole = async (req: Request, res: Response) => {
    logInfo(
        `Started:: newRole route with params  ${JSON.stringify(
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
        const userAllowed = await checkUserAllowedFor(userId, 'createRole');
        if (!userAllowed) {
            res.status(401).send(
                'User not authorised to perform this operation'
            );
            return false;
        }
        const role = req.body;
        const addedRole = await addRole(role);
        if (Object.keys(addedRole).length == 0) {
            res.status(200).send('Role exists already');
            return false;
        }
        res.status(200).json(addedRole);
        return true;
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};

export const assignRole = async (req: Request, res: Response) => {
    logInfo(
        `Started:: newRole route with params  ${JSON.stringify(
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
        const userAllowed = await checkUserAllowedFor(userId, 'assignRole');
        if (!userAllowed) {
            res.status(401).send(
                'User not authorised to perform this operation'
            );
            return false;
        }
        const role = req.body.role;
        const assignedRole = await assignRoleToUser(userId, role);
        if (Object.keys(assignedRole).length == 0) {
            res.status(200).send('Role exists already');
            return false;
        }
        res.status(200).json(assignedRole);
        return true;
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};


export const deleteRole = async (req: Request, res: Response) => {
    logInfo(
        `Started:: deleteRole route with params  ${JSON.stringify(
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
        const userAllowed = await checkUserAllowedFor(userId, 'deleteRole');
        if (!userAllowed) {
            res.status(401).send(
                'User not authorised to perform this operation'
            );
            return false;
        }
        const role = req.body.role;
        const deletedRole = await deleteRoleForUser(userId, role);
        if (Object.keys(deletedRole).length == 0) {
            res.status(200).send('Role did not exist');
            return false;
        }
        res.status(200).json(deletedRole);
        return true;
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};


export const changeRoleLevel = async (req: Request, res: Response) => {
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
            'changeRoleLevel'
        );
        if (!userAllowed) {
            res.status(401).send(
                'User not authorised to perform this operation'
            );
            return false;
        }
        const role = req.body;
        const updatedRole = await updateRoleLevel(role);
        if (Object.keys(updatedRole).length == 0) {
            res.status(400).send('Could not update Role');
            return false;
        }
        res.status(200).json(updatedRole);
        return true;
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};
