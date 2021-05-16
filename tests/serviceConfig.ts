const UserIsNotVolunteer = {
    firstName: 'test',
    email: 'test.user@corona-school.de',
    password: 'password',
};

const userIsVolunteer = {
    firstName: 'test',
    email: 'test.user1@corona-school.de',
    password: 'password',
};

const UserIsNotPupil = {
    firstName: 'test',
    email: 'test.user@corona-school.de',
    password: 'password',
};

const userIsPupil = {
    firstName: 'test',
    email: 'test.user1@corona-school.de',
    password: 'password',
};

const test_course = {
    title: 'Deutsch course',
    category: 'Deutsch',
    tags: ['Deutsch', 'cs', 'aa'],
    target_group: '5-10',
    times: [
        {
            startTime: new Date('2021-05-05 15:30:00'),
            endTime: new Date('2021-05-05 17:30:00'),
        },
        {
            startTime: new Date('2021-05-10 15:30:00'),
            endTime: new Date('2021-05-15 18:30:00'),
        },
        {
            startTime: new Date('2021-05-20 20:30:00'),
            endTime: new Date('2021-05-25 22:30:00'),
        },
    ],
    description: 'Hello world',
};

export {
    userIsVolunteer,
    UserIsNotVolunteer,
    test_course,
    UserIsNotPupil,
    userIsPupil,
};
