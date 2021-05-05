import {
    addUser,
    deleteTestRoles,
    deleteUser,
    findRole,
    getUserRole,
    setupTestRoles,
    setupTestTasks,
    setupTestUserAdminRole,
    setupTestUserPupilRole,
    tearDownTestTasks,
} from '../../../../services/dataStore';

process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
import { server } from '../../../../server';
import { invalidUserPhone, validUser } from '../../../userConfiguration';

describe('Try to delete roles for user', async function () {
    before(async function () {
        const user = await addUser(validUser);
        await setupTestRoles();
        await setupTestUserAdminRole(user.id);
        await setupTestTasks();
    });
    after(async function () {
        await deleteUser(validUser.email);
        await deleteTestRoles();
        await tearDownTestTasks();
    });
    it('Assigns a role with login credentials that allow role deletion', function (done) {
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
                    .post('/roles/delete')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ role: 'unitTestAdmin' })
                    .end(async (error, response) => {
                        try {
                            chai.assert.hasAllKeys(response.body, ['count']);
                            chai.assert.equal(
                                response.body.count,
                                1,
                                'Multiple deleted or none!'
                            );
                            const userRoles = await getUserRole(
                                response.body.userId
                            );
                            const roleNames = userRoles.map(
                                (obj) => obj.roleName
                            );
                            chai.assert.notInclude(roleNames, 'unitTestAdmin');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});

describe('Try to delete roles', async function () {
    before(async function () {
        const user = await addUser(validUser);
        await setupTestRoles();
        await setupTestUserPupilRole(user.id);
        await setupTestTasks();
    });
    after(async function () {
        await deleteUser(validUser.email);
        await deleteTestRoles();
        await tearDownTestTasks();
    });

    it('Create a role with login credentials that dont allow role deletion', function (done) {
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
                    .post('/roles/delete')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ role: 'unitTestAdmin' })
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(response.status, 401);
                            chai.assert.equal(
                                response.text,
                                'User not authorised to perform this operation'
                            );
                            const userRoles = await getUserRole(
                                response.body.userId
                            );
                            const roleNames = userRoles.map(
                                (obj) => obj.roleName
                            );
                            chai.assert.notInclude(roleNames, 'unitTestAdmin');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});
