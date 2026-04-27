export interface LoginCredentials {
    email: string;
    password: string;
};

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
};

export interface User {
    id: number;
    name: string;
    is2FAEnabled: boolean;
    hasWebPush: boolean;
}