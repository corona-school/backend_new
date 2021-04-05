import { Request, Response, NextFunction } from 'express';
import { logError, logInfo } from '../../services/logger';
import { passwordSchema } from '../../utils/validationSchema';
import {
    emailVerify,
    phoneVerify,
    resetPasswordVerify,
} from '../../services/verificationService';

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logInfo(
        `Started:: Verify email route with params  ${JSON.stringify(
            req.params,
            null,
            4
        )}`
    );
    try {
        const { userId, token } = req.params;
        const verify = await emailVerify({
            userId,
            token,
        });

        res.json({
            response: verify,
        });
    } catch (error) {
        logError(`Error occurred : ${error}`);
        next(new Error(`Error occurred : ${error}`));
    }
};

export const verifyPhone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logInfo(
        `Started:: Verify phone route with params ${JSON.stringify(
            req.params,
            null,
            4
        )}`
    );
    try {
        const { userId, token } = req.params;
        const verify = await phoneVerify({
            userId,
            token,
        });

        res.json({
            response: verify,
        });
    } catch (error) {
        logError(`Error occurred : ${error}`);
        next(new Error(`Error occurred : ${error}`));
    }
};

export const verifyResetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logInfo(
        `Started:: Verify phone route with params ${JSON.stringify(
            req.params,
            null,
            4
        )}`
    );

    const { userId, token } = req.params;
    const { error, value } = passwordSchema.validate(req.body);
    const { password } = value;

    if (error) {
        logError(`${error.message}`);
        next(new Error(error.message));
    } else {
        try {
            const verify = await resetPasswordVerify({
                userId,
                token,
                password,
            });

            res.json({
                response: verify,
            });
        } catch (error) {
            next(new Error(error.message));
        }
    }
};
