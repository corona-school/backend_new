export const validUser = {
    firstName: 'test',
    lastName: 'user',
    email: 'test.user@corona-school.de',
    password: 'password',
    notificationLevel: 'all' as const,
    phone: '+4917674853265',
};

export const invalidUserPassword = {
    firstName: 'test',
    lastName: 'user',
    email: 'test.user@corona-school.de',
    password: 'password1',
};
export const invalidUserEmail = {
    firstName: 'test',
    lastName: 'user',
    email: 'testuser@corona-school.de',
    password: 'password',
};

export const invalidUserPhone = {
    firstName: 'test',
    lastName: 'user',
    email: 'test.user@corona-school.de',
    password: 'password',
    phone: '+4917674853266',
};

export const alternateUser = {
    firstName: 'test1',
    lastName: 'user1',
    email: 'test1.user1@corona-school.de',
    phone: '+4917674853266',
};
