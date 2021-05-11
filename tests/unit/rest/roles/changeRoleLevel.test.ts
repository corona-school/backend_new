import { validUser } from '../../../userConfiguration';
import chai from 'chai';
import { server } from '../../../../server';
import {
    addUser,
    deleteTestRoles,
    deleteUser,
    findRole,
    findTask,
    setupTestRoles,
    setupTestTasks,
    setupTestUserAdminRole,
    setupTestUserPupilRole,
    tearDownTestTasks,
} from '../../../../services/dataStore';

describe('Try to change roles', async function () {
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
    it('Change a role with login credentials that allow', function (done) {
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
                    .post('/roles/changeLevel')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ name: 'unitTestPupil', level: 4 })
                    .end(async (error, response) => {
                        try {
                            chai.assert.hasAllKeys(response.body, [
                                'id',
                                'name',
                                'level',
                                'autoassign',
                            ]);
                            const role = await findRole('unitTestPupil');
                            chai.assert.isNotNull(role, 'Role deleted?');
                            if (role !== null) {
                                chai.assert.equal(
                                    role.level,
                                    4,
                                    'Role not updated?'
                                );
                            }
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});

describe('Try to change roles', async function () {
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

    it('Change a role with login credentials that dont allow role assignment', function (done) {
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
                    .post('/roles/changeLevel')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ role: 'unitTestVolunteer', level: 4 })
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(response.status, 401);
                            chai.assert.equal(
                                response.text,
                                'User not authorised to perform this operation'
                            );
                            const role = await findRole('unitTestVolunteer');
                            chai.assert.isNotNull(role, 'Role deleted?');
                            if (role !== null) {
                                chai.assert.equal(
                                    role.level,
                                    2, // Default level configured in the test setup is 2
                                    'Role not updated?'
                                );
                            }
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
    });
});
