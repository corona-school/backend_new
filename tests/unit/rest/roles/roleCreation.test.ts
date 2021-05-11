import {
    addUser,
    deleteTestRoles,
    deleteUser,
    findRole,
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

describe('Try to create roles', async function () {
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
    it('Create a role with login credentials that allow role creation', function (done) {
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
                    .post('/roles/new')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ name: 'unitTest', level: 1 })
                    .end(async (error, response) => {
                        try {
                            chai.assert.hasAllKeys(response.body, [
                                'id',
                                'name',
                                'autoassign',
                                'level',
                            ]);
                            const role = await findRole('unitTest');
                            chai.assert.isNotNull(role, 'Role not created?');
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});

describe('Try to create roles', async function () {
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

    it('Create a role with login credentials that allow role creation', function (done) {
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
                    .post('/roles/new')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ name: 'unitTest', level: 1 })
                    .end(async (error, response) => {
                        try {
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
