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

describe('Checks if user can reset password', function () {
    before(async function () {
        const user = {
            firstName: 'test',
            lastName: 'user',
            email: 'ayush.pandey@corona-school.de',
            notificationLevel: 'all' as const,
            phone: '+49017674853265',
            password: 'password',
        };
        await addUser(user);
    });
    after(async function () {
        await deleteUser('ayush.pandey@corona-school.de');
    });
    it('Try refreshing the password for an account that does not exist', function (done) {
        const userDetail = {
            email: 'testuser@corona-school.de',
        };
        const loginDetail = {
            email: 'ayush.pandey@corona-school.de',
            password: 'password',
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
                        chai.assert.isNotNull(response.body.error);
                        chai.assert.equal(
                            response.body.error.message,
                            'Email not registered'
                        );
                        done();
                    });
            });
    });
    it('Try refreshing the password for an account that does exist but with incorrect bearer token', function (done) {
        const userDetail = {
            email: 'ayush.pandey@corona-school.de',
        };
        const accessToken = 'random_access_token';
        chai.request(server)
            .post('/auth/password_reset')
            .set('Authorization', 'Bearer ' + accessToken)
            .type('json')
            .send(userDetail)
            .end(async (error, response) => {
                chai.assert.equal(response.error.status, 401);
                chai.assert.equal(response.error.text, 'Unauthorized');
                done();
            });
    });

    it('Try refreshing the password for an account that does exist', function (done) {
        const userDetail = {
            email: 'ayush.pandey@corona-school.de',
        };
        const loginDetail = {
            email: 'ayush.pandey@corona-school.de',
            password: 'password',
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
                        chai.assert.isNotNull(response.body.response.resetLink);
                        done();
                    });
            });
    });
});
