export interface LoginCredentials {
    email: string;
    password: string;
};

export interface Greenhouse {
    id: number;
    name: string;
    isPublic: boolean;
    devices: {
        id: number;
        mac_address: string;
        greenhouseId: number;
    }[];
    allowExperiments: boolean;
}

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
    greenhouses: Greenhouse[];
}