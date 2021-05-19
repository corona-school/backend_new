import chai from 'chai';
import chaiHttp from 'chai-http';
import { server } from '../../../../server';
import {
    alternateUser,
    invalidUserEmail,
    validUser,
} from '../../../userConfiguration';
import {addUser, findUser} from "../../../../dataStore/types/user";
import {deleteUser} from "../../../../dataStore/testingQueries";

process.env.NODE_ENV = 'test';
chai.use(chaiHttp);

describe('Checks if the user route is available', function () {
    it('Checks if the user route is setup properly.', function (done) {
        chai.request(server)
            .get('/user/ping')
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

describe('Try changing user data', function () {
    before(async function () {
        await addUser(validUser);
    });
    after(async function () {
        await deleteUser(alternateUser.email);
    });
    it('tries to change all the data of the user', function (done) {
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
                    .post('/user/save')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(alternateUser)
                    .type('json')
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(
                                response.body.response.message,
                                'User data has been updated',
                                'Improper message received'
                            );
                            const updateId = response.body.response.data;
                            const updatedUsers = await findUser({
                                email: alternateUser.email,
                            });

                            chai.assert.equal(
                                updatedUsers.count,
                                1,
                                'Error in the user data. Does not match with the update'
                            );
                            chai.assert.equal(
                                updateId,
                                updatedUsers.users[0].id,
                                'Incorrect user was updated?'
                            );
                            done();
                        } catch (e) {
                            //This deletion is written to cleanup the add user in case the test fails to modify the user.
                            await deleteUser(validUser.email);
                            done(e);
                        }
                    });
            });
    });
});
