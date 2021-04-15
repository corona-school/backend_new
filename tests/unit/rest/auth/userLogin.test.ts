import {
    addUser,
    deleteUser,
    getRefreshToken,
} from '../../../../services/dataStore';

process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';

describe('Checks if the auth route is available', function () {
    it('Checks if the auth route is setup properly.', function (done) {
        chai.request(server)
            .get('/auth/ping')
            .end((error, response) => {
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
            });
    });
});

describe('Checks if a user can login', function () {
    before(async function () {
        const user = {
            firstName: 'test',
            lastName: 'user',
            email: 'ayushpandey@corona-school.de',
            notificationLevel: 'all' as const,
            phone: '+49017674853266',
            password: 'password',
        };
        await addUser(user);
    });
    after(async function () {
        await deleteUser('ayushpandey@corona-school.de');
    });
    it('Try logging in with an incorrect password', function (done) {
        const loginDetail = {
            email: 'ayushpandey@corona-school.de',
            password: 'passwor',
        };

        chai.request(server)
            .post('/auth/login')
            .type('json')
            .send(loginDetail)
            .end(async (error, response) => {
                chai.assert.isNotNull(response.body.error);
                chai.assert.equal(
                    response.body.response.message,
                    'Invalid email/password'
                );
                done();
            });
    });
    it('Try logging in with an correct password', function (done) {
        const loginDetail = {
            email: 'ayushpandey@corona-school.de',
            password: 'password',
        };

        chai.request(server)
            .post('/auth/login')
            .type('json')
            .send(loginDetail)
            .end(async (error, response) => {
                chai.assert.isDefined(response.body.response);
                chai.assert.deepEqual(response.body.response.message, {
                    login: 'Successfull',
                    token: 'Refresh token added',
                });

                const authId = response.body.response.authId;
                const refreshTokens = await getRefreshToken(authId);
                chai.assert.equal(
                    response.body.response.refreshToken,
                    refreshTokens.token,
                    'Incorrect refresh token was received'
                );
                done();
            });
    });
});
