import { validUser } from '../../../userConfiguration';
import chai from 'chai';
import { server } from '../../../../server';
import {
    addUser,
    deleteTestRoles,
    deleteUser,
    findTask,
    setupTestRoles,
    setupTestTasks,
    setupTestUserAdminRole,
    setupTestUserPupilRole,
    tearDownTestTasks,
} from '../../../../services/dataStore';

describe('Try to change tasks', async function () {
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
    it('Change a task with login credentials that allow', function (done) {
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
                    .post('/tasks/changeLevel')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ name: 'createRole', level: 4 })
                    .end(async (error, response) => {
                        try {
                            chai.assert.hasAllKeys(response.body, [
                                'id',
                                'name',
                                'minLevelRequired',
                                'createdOn',
                            ]);
                            const role = await findTask('createRole');
                            chai.assert.isNotNull(role, 'Task deleted?');
                            if (role !== null) {
                                chai.assert.equal(
                                    role.minLevelRequired,
                                    4,
                                    'Task not updated?'
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
describe('Try to change tasks', async function () {
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
    it('Create a task with login credentials that dont allow task creation', function (done) {
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
                    .post('/tasks/new')
                    .set('Authorization', 'Bearer ' + accessToken)
                    .type('json')
                    .send({ name: 'createRole', minLevelRequired: 4 })
                    .end(async (error, response) => {
                        try {
                            chai.assert.equal(response.status, 401);
                            chai.assert.equal(
                                response.text,
                                'User not authorised to perform this operation'
                            );
                            const role = await findTask('createRole');
                            chai.assert.isNotNull(role, 'Task deleted?');
                            if (role !== null) {
                                chai.assert.equal(
                                    role.minLevelRequired,
                                    1,
                                    'Task updated?'
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
