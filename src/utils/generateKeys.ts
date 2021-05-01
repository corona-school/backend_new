import * as crypto from 'crypto';

const accessTokenKey = crypto.randomBytes(32).toString('hex');
const refreshTokenKey = crypto.randomBytes(32).toString('hex');

console.table({ accessTokenKey, refreshTokenKey });
