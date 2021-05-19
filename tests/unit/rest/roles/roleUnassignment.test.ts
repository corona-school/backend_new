import { addUser, getUserRole } from '../../../../dataStore/types/user';

process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';
import { invalidUserPhone, validUser } from '../../../userConfiguration';
import {
    deleteUser,
    setupTestUserAdminRole,
    setupTestUserPupilRole,
} from '../../../../dataStore/testingQueries';

describe('Try to remove roles from user', async function () {
    before(async function () {
        const user = await addUser(validUser);
        await setupTestUserAdminRole(user.id);
        await setupTestUserPupilRole(user.id);
    });
    after(async function () {
        await deleteUser(validUser.email);
    });
    it('remove a role with login credentials that allow role removal', function (done) {
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
                    .post('/roles/remove')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ role: 'unitTestPupil', user: validUser.email })
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(
                                response.body.count,
                                1,
                                'Role not deleted?'
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});

describe.only('Try to delete roles', async function () {
    before(async function () {
        const user = await addUser(validUser);
        await setupTestUserPupilRole(user.id);
    });
    after(async function () {
        await deleteUser(validUser.email);
    });

    it('remove a role with login credentials that dont allow role removal', function (done) {
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
                    .post('/roles/remove')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ role: 'unitTestPupil', user: validUser.email })
                    .end(async (error, response) => {
                        try {
                            console.log(response.text);
                            chai.assert.equal(response.status, 401);
                            chai.assert.equal(
                                response.text,
                                'User not authorised to perform this operation'
                            );
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});
