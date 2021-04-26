import { Request, Response, NextFunction } from 'express';
import { emailSchema } from '../../utils/validationSchema';
import { logError, logInfo } from '../../services/logger';
import {
    emailChange,
    phoneChange,
    deleteUserData,
    userUpdate,
} from '../../services/userService';

export const changeEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { error, value } = emailSchema.validate(req.body);

    logInfo(`Started:: Email change route with params ${value}`);

    if (error) {
        logError('Invalid email');
        next(new Error(error.message));
    }

    const { email } = value;

    try {
        // Getting the user id from auth middleware
        const userId = (<any>req).user.userid._id;

        if (userId == null || userId == undefined) {
            logError('unable to get userID');
            next(new Error('unable to get userID'));
        }

        const updateEmail = await emailChange({
            userId,
            email,
        });
        res.json({
            response: updateEmail,
        });
    } catch (error) {
        next(new Error(error.message));
    }
};

export const changePhone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Expecting phone number string
    const { phone } = req.body;

    logInfo(`Started:: Phone change route with params ${phone}`);

    if (!phone) {
        logError('Phone number not provided');
        next(new Error('Phone number cannot be empty'));
    }

    try {
        // Getting the user id from auth middleware
        const userId = (<any>req).user.userid._id;

        if (userId == null || userId == undefined) {
            logError('unable to get userID');
            next(new Error('unable to get userID'));
        }

        const updatePhone = await phoneChange({ userId, phone });
        res.json({
            response: updatePhone,
        });
    } catch (error) {
        next(new Error(error.message));
    }
};

export const userDataDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logInfo(`Started:: Delete user route`);

    try {
        // Getting the user id from auth middleware
        const userId = (<any>req).user.userid._id;

        if (userId == null || userId == undefined) {
            logError('Unable to get userID');
            next(new Error('Unable to get userID'));
        }

        const userDelete = await deleteUserData({ userId });
        res.json({
            response: userDelete,
        });
    } catch (error) {
        next(new Error(error.message));
    }
};

export const updateUserData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logInfo(`Started:: Save user data route`);

    try {
        // Getting the user id from auth middleware
        const userId = (<any>req).user.userid._id;
        const userData = req.body;

        if (userId == null || userId == undefined) {
            logError('Unable to get userID');
            next(new Error('Unable to get userID'));
        }

        const update_user = await userUpdate(userData, userId);
        res.json({
            response: update_user,
        });
    } catch (error) {
        next(new Error(error.message));
    }
};
