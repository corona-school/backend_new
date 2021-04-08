import { Request, Response, NextFunction } from 'express';
import { emailSchema, registerDataSchema } from '../../utils/validationSchema';
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

    logInfo(
        `Started:: Register route with params ${JSON.stringify(value, null, 4)}`
    );

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
    const { email, password } = req.body;
    logInfo(
        `Started:: Login route with params ${JSON.stringify(
            { email, password },
            null,
            4
        )}`
    );

    try {
        const login = await loginUser({ email, password });
        res.json({
            response: login,
        });
    } catch (error) {
        next(new Error(error.message));
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { error, value } = emailSchema.validate(req.body);
    logInfo(
        `Started:: Forget password route with params ${JSON.stringify(
            value,
            null,
            4
        )}`
    );

    if (error) {
        logError(`${error.message}`);
        next(new Error(error.message));
    } else {
        try {
            const { email } = value;
            const resetPassword = await passwordReset(email);
            res.json({
                response: resetPassword,
            });
        } catch (error) {
            next(new Error(error.message));
        }
    }
};
