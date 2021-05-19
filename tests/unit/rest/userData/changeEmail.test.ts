import chai from 'chai';
import chaiHttp from 'chai-http';
import { server } from '../../../../server';
import { invalidUserEmail, validUser } from '../../../userConfiguration';
import { addUser, findUser } from '../../../../dataStore/types/user';
import { deleteUser } from '../../../../dataStore/testingQueries';
import { getEmailNotifications } from '../../../../dataStore/dataStore';

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

describe('Try changing Email', function () {
    before(async function () {
        await addUser(validUser);
    });
    after(async function () {
        //Deleting the invalid email user because the test changes it to the incorrect email.
        await deleteUser(invalidUserEmail.email);
    });
    it('tries to change to an invalid email', function (done) {
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
                    .post('/user/change-email')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ email: invalidUserEmail.email })
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(
                                response.body.response.message,
                                'Email has been updated',
                                'Improper message returned'
                            );
                            const updatedUsers = await findUser({
                                email: invalidUserEmail.email,
                            });
                            chai.assert.equal(
                                updatedUsers.count,
                                1,
                                'Could not find Updated User. Possible update propagation issue'
                            );

                            const updatedNotificationCount = (
                                await getEmailNotifications(
                                    invalidUserEmail.email
                                )
                            ).length;
                            chai.assert.equal(
                                updatedNotificationCount,
                                1,
                                'Email not sent?'
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});
