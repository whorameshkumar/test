import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string; 
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

// new type/property bana rehye hain called AuthRequest 
export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string; 
        id?:string; // ? means optional 
    }
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
  id: string; 
}

export interface ITenant { // I convention hai for interface, this is not type, baqi interface kaa naam kuch bhi rakho it's upto u
    name: string,
    address: string,
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface CreateUserRequest extends Request {
    body: UserData;
}