process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';
import {
    addUser,
    deleteUser,
    findUser,
    getUserCount,
} from '../../../../services/dataStore';

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

describe('Try creating user', function () {
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
        await deleteUser('ayushpandey@corona-school.de');
        await deleteUser('ayush.pandey@corona-school.de');
    });
    this.timeout(5000);
    it('Try creating a new user with an email that exists', (done) => {
        const user = {
            firstName: 'test',
            lastName: 'user',
            email: 'ayush.pandey@corona-school.de',
            password: 'password',
        };
        let initialUserCount = -1;
        getUserCount().then((response) => {
            initialUserCount = response;
        });
        chai.request(server)
            .post('/auth/signup')
            .type('json')
            .send(user)
            .end(async (error, response) => {
                chai.assert.isNotNull(response.body.error);
                chai.assert.equal(
                    response.body.error.message,
                    'User email already exists'
                );

                const userCountAfterRequest = await getUserCount();
                chai.assert.equal(
                    initialUserCount,
                    userCountAfterRequest,
                    'Database was updated, User count doesnt match'
                );
                done();
            });
    });

    it('Try creating a new user with an email that does not exist', (done) => {
        const user = {
            firstName: 'test',
            lastName: 'user',
            email: 'ayushpandey@corona-school.de',
            password: 'password',
        };
        let initialUserCount = -1;
        getUserCount().then((response) => {
            initialUserCount = response;
        });

        chai.request(server)
            .post('/auth/signup')
            .type('json')
            .send(user)
            .end(async (error, response) => {
                const userId = response.body.response.data.id;
                const userEmail = response.body.response.data.email;
                chai.assert.isNotNull(response.body.response.data);
                chai.assert.equal(
                    response.body.response.message,
                    'User has been registered'
                );
                const userCountAfterRequest = await getUserCount();

                chai.assert.equal(
                    initialUserCount,
                    userCountAfterRequest - 1,
                    'Database was updated, User count doesnt match'
                );

                const fetchedUser = await findUser(userEmail);
                chai.assert.lengthOf(
                    fetchedUser,
                    1,
                    'More than one users created'
                );
                chai.assert.equal(
                    fetchedUser[0].id,
                    userId,
                    'User ID returned while creating does not match the one fetched. Records do not match'
                );
                done();
            });
    });
});
