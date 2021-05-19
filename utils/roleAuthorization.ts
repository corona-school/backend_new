import { NextFunction, Request, Response } from 'express';
import { getUserRoles } from '../dataStore/types/user';

export const checkRole = (requiredRoles: string[]) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).send('User not authorised to perform this operation');
    } else {
        const userId = (<any>req).user.userid._id;
        const userRoles = await getUserRoles(userId);

        const userRolesList = userRoles.map(
            (roleObject) => roleObject.roleName
        );
        const roleInHierarchy = requiredRoles.filter((role) =>
            userRolesList.includes(role)
        );
        console.log(roleInHierarchy);

        if (roleInHierarchy.length === 0) {
            return res.status(401).send('User not authorised to perform this operation');
        }
    }
    return next();
};
