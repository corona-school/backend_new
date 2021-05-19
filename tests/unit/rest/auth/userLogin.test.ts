import { addUser } from '../../../../dataStore/types/user';

process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';
import { invalidUserPassword, validUser } from '../../../userConfiguration';
import {
    deleteUser,
    getRefreshTokenFromAuthId,
} from '../../../../dataStore/testingQueries';

describe('Checks if the auth route is available', function () {
    it('Checks if the auth route is setup properly.', function (done) {
        chai.request(server)
            .get('/auth/ping')
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

describe('Checks if a user can login', function () {
    before(async function () {
        const user = validUser;
        await addUser(user);
    });
    after(async function () {
        await deleteUser(validUser.email);
    });
    it('Try logging in with an incorrect password', function (done) {
        const loginDetail = {
            email: validUser.email,
            password: invalidUserPassword.password,
        };

        chai.request(server)
            .post('/auth/login')
            .type('json')
            .send(loginDetail)
            .end(async (error, response) => {
                try {
                    chai.assert.isNotNull(response.body.error);
                    chai.assert.equal(
                        response.body.response.message,
                        'Invalid email/password'
                    );
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
    it('Try logging in with an correct password', function (done) {
        const loginDetail = {
            email: validUser.email,
            password: validUser.password,
        };

        chai.request(server)
            .post('/auth/login')
            .type('json')
            .send(loginDetail)
            .end(async (error, response) => {
                try {
                    chai.assert.isDefined(response.body.response);
                    chai.assert.deepEqual(response.body.response.message, {
                        login: 'Successfull',
                        token: 'Refresh token added',
                    });

                    const authId = response.body.response.authId;
                    const refreshTokens = await getRefreshTokenFromAuthId(
                        authId
                    );

                    chai.assert.equal(
                        response.body.response.refreshToken,
                        refreshTokens.token,
                        'Incorrect refresh token was received'
                    );
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});
