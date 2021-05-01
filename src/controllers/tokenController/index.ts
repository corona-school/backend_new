import { Request, Response, NextFunction } from 'express';
import { logError, logInfo } from '../../services/logger';
import { tokenRefresh } from '../../services/refreshTokenService';

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { refreshToken } = req.body;
    logInfo(`Started:: Refresh-token route with params ${refreshToken}`);

    // Getting the user id from auth middleware
    const userId = (<any>req).user.userid._id;

    if (userId == null || userId == undefined) {
        logError('Unable to get userID');
        throw new Error('Unable to get userID');
    }

    try {
        const getRefreshToken = await tokenRefresh({
            userId,
            refreshToken,
        });
        res.json({
            response: getRefreshToken,
        });
    } catch (error) {
        next(new Error(error.message));
    }
};
