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
export interface StoreAdminJwt {
    aud: string;
    iss: string;
    iat: number;
    nbf: number;
    exp: number;
    jti: string;
    sub: string;
    user: {
        id: number;
        email: string;
        locale: string;
    };
    owner: {
        id: number;
        email: string;
    };
    url: string;
    channel_id: number | null;
}
export interface CustomerJwt {
    customer: {
        id: number;
        email: string;
        group_id: string;
    };
    iss: string;
    sub: string;
    iat: number;
    exp: number;
    version: number;
    aud: string;
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
export interface JwtPayload {
    iss: string;
    iat: number;
    operation: string;
    store_hash: string;
    customer_id: number;
    channel_id: number;
    jti: string;
    redirect_url?: string;
}
