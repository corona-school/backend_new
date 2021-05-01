import { logError } from '../services/logger';

let accessTokenKey: string, refreshTokenKey: string;
if (!process.env.ACCESS_TOKEN_KEY || !process.env.REFRESH_TOKEN_KEY) {
    logError('AccessToken and Refresh key cannot be undefined/null');
    throw new Error('AccessToken and Refresh key cannot be undefined/null');
} else {
    (accessTokenKey = process.env.ACCESS_TOKEN_KEY),
        (refreshTokenKey = process.env.REFRESH_TOKEN_KEY);
}

export const keys = {
    accessTokenKey,
    refreshTokenKey,
};
