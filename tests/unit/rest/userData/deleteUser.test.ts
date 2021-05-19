import chai from 'chai';
import chaiHttp from 'chai-http';
import { server } from '../../../../server';
import { invalidUserEmail, validUser } from '../../../userConfiguration';
import { addUser, findUser } from '../../../../dataStore/types/user';
import { deleteUser } from '../../../../dataStore/testingQueries';

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

describe('Try deleting user', function () {
    before(async function () {
        await addUser(validUser);
    });
    it('tries to delete a user that does not exist', function (done) {
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
                    .post('/user/delete')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(async (error, response) => {
                        try {
                            chai.assert.isNotNull(
                                response.body.response.message
                            );
                            const user = await findUser({
                                email: validUser.email,
                            });
                            chai.assert.equal(
                                user.count,
                                0,
                                'User still exists?'
                            );
                            done();
                        } catch (e) {
                            //This deletion is written to cleanup the add user in case the test fails to delete the user.
                            await deleteUser(validUser.email);
                            done(e);
                        }
                    });
            });
    });
});
