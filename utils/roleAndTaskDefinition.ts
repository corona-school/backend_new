type task = {
    name: string;
    roles: string[];
};

//Individual task definitions
const assignRole: task = {
    name: 'assignRole',
    roles: ['admin'],
};
const removeRole: task = {
    name: 'removeRole',
    roles: ['admin', 'tutor'],
};

//exported roles and task definitions
export const ROLES = [
    'user',
    'pupil',
    'volunteer',
    'admin',
    'unitTestAdmin',
    'unitTestPupil',
    'unitTestVolunteer',
];
export const TASKS = {
    assignRole,
    removeRole,
};