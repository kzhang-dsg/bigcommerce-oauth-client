import { JwtPayload } from "jsonwebtoken";

export interface AccessToken {
    access_token: string;
    scope: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
    context: string;
    account_uuid: string;
}

export interface StoreAdminJwtPayload extends JwtPayload {
    user: {
        id: number;
        email: string;
        locale: string;
    };
    owner: {
        id: number;
        email: string;
    };
    url: string; // deep link url.
    channel_id?: number | null;
}

export interface CustomerJwtPayload extends JwtPayload {
    customer: {
        id: number;
        email: string;
        group_id: string;
    };
    version: number;
    application_id: string;
    store_hash: string;
    operation: string;
}

export interface OAuthCode {
    code: string;
    scope: string;
    context: string;
}

export interface Options {
    clientId: string;
    clientSecret: string;
    storeHash?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}

export interface CustomerSsoJwt {
    iss: string;
    iat: number;
    operation: string;
    store_hash: string;
    customer_id: number;
    channel_id: number;
    jti: string;
    redirect_url?: string;
}
