import { addUser } from '../../../../dataStore/types/user';

process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';
import { invalidUserEmail, validUser } from '../../../userConfiguration';
import {
    deleteUser,
    getRefreshTokenObject,
} from '../../../../dataStore/testingQueries';

describe('Checks if the token refresh route is available', function () {
    it('Checks if the token refresh route is setup properly.', function (done) {
        chai.request(server)
            .get('/token_refresh/ping')
            .end((error, response) => {
                try {
                    chai.assert.equal(
                        response.status,
                        200,
                        'Response status was not 200.'
                    );
                    chai.assert.equal(
                        response.text,
                        'pong',
                        'Improper message sent'
                    );
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});

describe('Try refreshing the token', async function () {
    before(async function () {
        const user = validUser;
        await addUser(user);
    });
    after(async function () {
        await deleteUser(validUser.email);
    });
    it('refreshes token for a user that is not logged in i.e. invalid refresh token', function (done) {
        const loginDetail = {
            email: validUser.email,
            password: validUser.password,
        };
        chai.request(server)
            .post('/auth/login')
            .type('json')
            .send(loginDetail)
            .end(async (error, response) => {
                const accessToken = response.body.response.accessToken;
                const invalidRefreshToken = {
                    refreshToken: 'InvalidrefreshToken',
                };
                chai.request(server)
                    .post('/token_refresh')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send(invalidRefreshToken)
                    .end(async (error, response) => {
                        try {
                            chai.assert.isNotNull(response.body.error);
                            chai.assert.equal(
                                response.body.error.message,
                                'Token/User is not valid'
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});

describe('Try refreshing the token', async function () {
    before(async function () {
        const user = validUser;
        await addUser(user);
    });
    after(async function () {
        await deleteUser(validUser.email);
    });
    it('refreshes token for a user that is logged in i.e. valid refresh token', function (done) {
        const loginDetail = {
            email: validUser.email,
            password: validUser.password,
        };
        chai.request(server)
            .post('/auth/login')
            .type('json')
            .send(loginDetail)
            .end(async (error, response) => {
                const accessToken = response.body.response.accessToken;
                const refreshToken = response.body.response.refreshToken;
                const refreshTokenObject = {
                    refreshToken: refreshToken,
                };
                chai.request(server)
                    .post('/token_refresh')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send(refreshTokenObject)
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(
                                response.body.response.message,
                                'New tokens generated',
                                'Problem Generating new tokens. Improper message received'
                            );
                            const tokenObject = await getRefreshTokenObject(
                                refreshToken
                            );
                            chai.assert.lengthOf(
                                tokenObject,
                                1,
                                'Improper number of tokens in the databse'
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});
