import { AxiosInstance } from "axios";
import { AccessToken, CustomerJwt, OAuthCode, Options, StoreAdminJwt } from "./model/oauth";
export declare class BigCommerceOAuthClient {
    private readonly options;
    readonly axiosInstance: AxiosInstance;
    constructor(options: Options);
    authorize<T extends OAuthCode, R extends AccessToken>(oauthCode: T, redirectUri: string): Promise<R>;
    verifyStoreAdminJwt(token: string): StoreAdminJwt;
    verifyCustomerJwt(token: string): CustomerJwt;
    createCustomerLoginJwt(customerId: number, redirectUrl?: string, channelId?: number): string;
    createStoreAdminJwt(accessToken: AccessToken, locale?: string, deepLinkUrl?: string, channelId?: number): string;
}
