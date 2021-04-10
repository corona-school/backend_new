import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from './../../../server/index';
import Joi from 'joi';
import { response } from 'express';
import { getUserCount } from '../../../services/dataStore';

describe('Checks if a new user can be registered', function () {
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

    it('Try creating a new user with an email that exists', async function () {
        const user = {
            firstName: 'test',
            lastName: 'user',
            email: 'ayush.pandey@corona-school.de',
            password: 'password',
        };
        const initialUserCount = await getUserCount();
        chai.request(server)
            .post('/auth/signup')
            .type('json')
            .send(user)
            .end((error, response) => {
                chai.assert.isNotNull(response.body.error);
                chai.assert.equal(
                    response.body.error.message,
                    'User email already exists'
                );
            });

        const userCountAfterRequest = await getUserCount();
        chai.assert.equal(
            initialUserCount,
            userCountAfterRequest,
            'Database was updated, User count doesnt match'
        );
    });
});
