import { AxiosInstance } from "axios";
import { AccessToken, CustomerJwtPayload, OAuthCode, Options, StoreAdminJwtPayload } from "./model/oauth";
export declare class BigCommerceOAuthClient {
    private readonly options;
    readonly axiosInstance: AxiosInstance;
    constructor(options: Options);
    authorize<T extends OAuthCode, R extends AccessToken>(oauthCode: T, redirectUri: string): Promise<R>;
    verifyStoreAdminJwt(token: string): StoreAdminJwtPayload;
    verifyCustomerJwt(token: string): CustomerJwtPayload;
    createCustomerLoginJwt(customerId: number, redirectUrl?: string, channelId?: number): string;
    createStoreAdminJwt(accessToken: AccessToken, locale?: string, deepLinkUrl?: string, channelId?: number): string;
}
