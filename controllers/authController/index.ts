import { Request, Response, NextFunction } from 'express';
import {
    emailSchema,
    loginSchema,
    registerDataSchema,
} from '../../utils/validationSchema';
import { logError, logInfo } from '../../services/logger';
import {
    loginUser,
    passwordReset,
    registerUser,
} from '../../services/authService';

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { error, value } = registerDataSchema.validate(req.body);

    logInfo(`Started:: Register route with params ${JSON.parse(value)}`);

    if (error) {
        logError(`${error.message}`);
        next(new Error(error.message));
    } else {
        try {
            const user = await registerUser(value);
            res.json({
                response: user,
            });
        } catch (error) {
            next(new Error(error.message));
        }
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { error, value } = loginSchema.validate(req.body);
    logInfo(`Started:: Login route with params ${JSON.parse(value)}`);

    if (error) {
        logError(`${error.message}`);
        next(new Error(error.message));
    } else {
        try {
            const login = await loginUser(value);
            res.json({
                response: login,
            });
        } catch (error) {
            next(new Error(error.message));
        }
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { error, value } = emailSchema.validate(req.body);
    logInfo(`Started:: Forget password route with params ${JSON.parse(value)}`);

    if (error) {
        logError(`${error.message}`);
        next(new Error(error.message));
    } else {
        try {
            const resetPassword = passwordReset(value);
            res.json({
                response: resetPassword,
            });
        } catch (error) {
            next(new Error(error.message));
        }
    }
};
