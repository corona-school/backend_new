import jwt from 'jsonwebtoken';

export const signAccessToken = (userid: string, key: string) => {
    const payload = {
        _id: userid,
    };

    const options = {
        expiresIn: '15m',
        issuer: 'corona-school',
        audience: userid,
    };

    return jwt.sign({ userid: payload }, key, options);
};

export const signRefreshToken = (userid: string, key: string) => {
    const payload = {
        _id: userid,
    };

    const options = {
        expiresIn: '1y',
        issuer: 'corona-school',
        audience: userid,
    };

    return jwt.sign({ userid: payload }, key, options);
};

export const signForgotToken = (userid: string, key: string) => {
    const payload = {
        _id: userid,
    };

    const options = {
        expiresIn: '10m',
        issuer: 'corona-school',
        audience: userid,
    };

    return jwt.sign({ userid: payload }, key, options);
};
