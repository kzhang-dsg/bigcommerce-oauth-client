import Axios, { AxiosInstance, AxiosResponse } from "axios";
import { ClientRequest } from "http";
import {
    AccessToken,
    CustomerJwtPayload,
    CustomerSsoJwt,
    OAuthCode,
    Options,
    StoreAdminJwtPayload,
} from "./model/oauth";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_OPTIONS: Options = {
    clientId: "",
    clientSecret: "",
    storeHash: "",
    baseURL: "https://login.bigcommerce.com",
    timeout: 60000,
    maxRetries: 5,
    retryDelay: 5000,
};

export class BigCommerceOAuthClient {
    readonly axiosInstance: AxiosInstance;

    constructor(private readonly options: Options) {
        this.options = Object.assign(DEFAULT_OPTIONS, this.options);
        this.axiosInstance = Axios.create({
            baseURL: this.options.baseURL,
            timeout: this.options.timeout,
            headers: {
                "Content-Type": "application/json",
                Accept: `application/json`,
            },
        });
    }

    async authorize<T extends OAuthCode, R extends AccessToken>(
        oauthCode: T,
        redirectUri: string
    ): Promise<R> {
        const payload = Object.assign(
            {
                client_id: this.options.clientId,
                client_secret: this.options.clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            },
            oauthCode
        );

        let retries = 0;
        while (true) {
            try {
                const response = await this.axiosInstance.post(
                    "/oauth2/token",
                    payload
                );
                return response.data;
            } catch (error: any) {
                if (
                    retries < (this.options.maxRetries || 0) &&
                    (error.response.status === 429 || // rate limit
                        error.response.status >= 500) // BigCommerce API down
                ) {
                    // retry if the error is recoverable
                    let retryDelay: number =
                        retries * (this.options.retryDelay || 0);
                    if (error.response.status === 429) {
                        retryDelay = parseInt(
                            error.response.headers[
                                "X-Rate-Limit-Time-Reset-Ms"
                            ] || retryDelay,
                            10
                        );
                    }

                    retries++;
                    console.error(
                        `Failed to call /oauth2/token, retrying for ${retries} time`,
                        error
                    );
                    await new Promise((resolve) =>
                        setTimeout(resolve, retryDelay)
                    );
                    continue;
                } else {
                    // throw the unrecoverable error
                    const request: ClientRequest = error.request;
                    const response: AxiosResponse = error.response;

                    if (request && response) {
                        throw new Error(
                            `Failed to call API ${request.protocol}://${
                                request.host
                            }${request.path}. Response Status: ${
                                response.status
                            }, Response: ${JSON.stringify(
                                response.data,
                                null,
                                0
                            )}.`,
                            { cause: error }
                        );
                    }

                    if (request && error.code === "ECONNABORTED") {
                        throw new Error(
                            `Failed to call API ${request.protocol}://${request.host}${request.path}. Timeout after ${this.options.timeout} ms.`,
                            { cause: error }
                        );
                    }

                    throw error;
                }
            }
        }
    }

    verifyStoreAdminJwt(token: string): StoreAdminJwtPayload {
        return jwt.verify(token, this.options.clientSecret, {
            algorithms: ["HS256"],
            audience: this.options.clientId,
        }) as StoreAdminJwtPayload;
    }

    verifyCustomerJwt(token: string): CustomerJwtPayload {
        return jwt.verify(token, this.options.clientSecret, {
            algorithms: ["HS256"],
            audience: this.options.clientId,
        }) as CustomerJwtPayload;
    }

    createCustomerLoginJwt(
        customerId: number,
        redirectUrl?: string,
        channelId = 1
    ): string {
        const payload: CustomerSsoJwt = {
            iss: this.options.clientId,
            iat: Math.floor(Date.now() / 1000),
            operation: "customer_login",
            store_hash: this.options.storeHash || "",
            customer_id: customerId,
            channel_id: channelId,
            jti: uuidv4(),
        };

        if (redirectUrl) {
            payload.redirect_url = redirectUrl;
        }

        return jwt.sign(payload, this.options.clientSecret, {
            expiresIn: "24h",
            algorithm: "HS256",
        });
    }

    createStoreAdminJwt(
        accessToken: AccessToken,
        locale: string = "en-US",
        deepLinkUrl: string = "/",
        channelId?: number
    ): string {
        const now = Math.floor(Date.now() / 1000);
        const payload: StoreAdminJwtPayload = {
            aud: this.options.clientId,
            iss: "bc",
            iat: now,
            nbf: now,
            jti: uuidv4(),
            sub: accessToken.context.replace("stores/", ""),
            user: {
                id: accessToken.user.id,
                email: accessToken.user.email,
                locale: locale,
            },
            owner: {
                id: accessToken.user.id,
                email: accessToken.user.email,
            },
            url: deepLinkUrl,
        };

        if (channelId) {
            payload.channel_id = channelId;
        }

        return jwt.sign(payload, this.options.clientSecret, {
            expiresIn: "24h",
            algorithm: "HS256",
        });
    }
}
