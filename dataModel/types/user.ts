export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    active: boolean;
    notificationLevel: 'all' | 'necessary';
    phone: string | null;
}
