import { logError, logInfo } from '../../services/logger';
import { Request, Response } from 'express';
import {
    assignRoleToUser,
    deleteRoleForUser,
} from './../../dataStore/dataStore';
import { ROLES } from '../../utils/roleAndTaskDefinition';
import { findUser } from '../../dataStore/types/user';

export const assignRole = async (req: Request, res: Response) => {
    logInfo(
        `Started:: assignRole route with params  ${JSON.stringify(
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
        const role = req.body.role;
        if (ROLES.includes(role)) {
            const assignedRole = await assignRoleToUser(userId, role);
            if (Object.keys(assignedRole).length == 0) {
                res.status(200).send('Role exists already');
                return false;
            }
            res.status(200).json(assignedRole);
            return true;
        } else {
            res.status(500).send('Role does not exist');
            return false;
        }
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};

export const removeRole = async (req: Request, res: Response) => {
    logInfo(
        `Started:: assignRole route with params  ${JSON.stringify(
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
        const role = req.body.role;
        const userEmail = req.body.user;
        const user = await findUser({ email: userEmail });
        const removedRole = await deleteRoleForUser(user.users[0].id, role);
        res.status(200).json(removedRole);
        return true;
    } catch (e) {
        logError('Could not find user who sent the request. Error: ' + e);
        res.send('Unexpected error when processing request');
        return false;
    }
};
