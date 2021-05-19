import { invalidUserEmail, validUser } from '../../../userConfiguration';

process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';
import {
    addUser,
    findUser,
    getUserCount,
} from '../../../../dataStore/types/user';
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
                } catch (e) {
                    console.log(e);
                } finally {
                    done();
                }
            });
    });
});

describe('Try creating user', function () {
    before(async function () {
        const user = validUser;
        await addUser(user);
    });
    after(async function () {
        await deleteUser(validUser.email);
        await deleteUser(invalidUserEmail.email);
    });
    it('Try creating a new user with an email that exists', (done) => {
        const user = {
            firstName: 'test',
            lastName: 'user',
            email: validUser.email,
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
                try {
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
                } catch (e) {
                    done(e);
                }
            });
    });

    it('Try creating a new user with an email that does not exist', (done) => {
        const user = {
            firstName: invalidUserEmail.firstName,
            lastName: invalidUserEmail.lastName,
            email: invalidUserEmail.email,
            password: invalidUserEmail.password,
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
                try {
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

                    const fetchedUsers = await findUser({ email: userEmail });
                    chai.assert.equal(
                        fetchedUsers.count,
                        1,
                        'More than one users created'
                    );
                    chai.assert.equal(
                        fetchedUsers.users[0].id,
                        userId,
                        'User ID returned while creating does not match the one fetched. Records do not match'
                    );
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});
