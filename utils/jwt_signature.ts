import jwt from 'jsonwebtoken';

export const signAccessToken = (userid: string, key: string) => {
    const payload = {
        userid,
    };

    const options = {
        expiresIn: '15m',
        issuer: 'lern-fair.com',
        audience: userid,
    };

    return jwt.sign({ payload }, key, options);
};

export const signRefreshToken = (userid: string, key: string) => {
    const payload = {
        userid,
    };

    const options = {
        expiresIn: '30 days',
        issuer: 'lern-fair.com',
        audience: userid,
    };

    return jwt.sign({ payload }, key, options);
};

export const signForgotToken = (userid: string, key: string) => {
    const payload = {
        userid,
    };

    const options = {
        expiresIn: '5m',
        issuer: 'lern-fair.com',
        audience: userid,
    };

    return jwt.sign({ payload }, key, options);
};

export const generateOnetimeToken = (userid: string, key: string) => {
    const payload = {
        userid,
    };

    const options = {
        expiresIn: '2 days',
        issuer: 'lern-fair.com',
        audience: userid,
    };

    return jwt.sign({ payload }, key, options);
};
