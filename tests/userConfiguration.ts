export const validUser = {
    firstName: 'test',
    lastName: 'user',
    email: 'test.user@corona-school.de',
    password: 'password',
    notificationLevel: 'all' as const,
    phone: '000000000000',
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
