import { addUser } from '../../../../dataStore/types/user';

process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';
import { invalidUserEmail, validUser } from '../../../userConfiguration';
import { deleteUser } from '../../../../dataStore/testingQueries';

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

describe('Checks if user can reset password', function () {
    before(async function () {
        const user = validUser;
        await addUser(user);
    });
    after(async function () {
        await deleteUser(validUser.email);
    });
    it('Try refreshing the password for an account that does not exist', function (done) {
        const userDetail = {
            email: invalidUserEmail.email,
        };
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
                chai.request(server)
                    .post('/auth/password_reset')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send(userDetail)
                    .end(async (error, response) => {
                        try {
                            chai.assert.isNotNull(response.body.error);
                            chai.assert.equal(
                                response.body.error.message,
                                'Email not registered'
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
    it('Try refreshing the password for an account that does exist but with incorrect bearer token', function (done) {
        const userDetail = {
            email: validUser.email,
        };
        const accessToken = 'random_access_token';
        chai.request(server)
            .post('/auth/password_reset')
            .set('Authorization', 'Bearer ' + accessToken)
            .type('json')
            .send(userDetail)
            .end(async (error, response) => {
                try {
                    chai.assert.equal(response.error.status, 401);
                    chai.assert.equal(response.error.text, 'Unauthorized');
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it('Try refreshing the password for an account that exists', function (done) {
        const userDetail = {
            email: validUser.email,
        };
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
                chai.request(server)
                    .post('/auth/password_reset')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send(userDetail)
                    .end(async (error, response) => {
                        try {
                            chai.assert.isNotNull(
                                response.body.response.resetLink
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});
