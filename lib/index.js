"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigCommerceOAuthClient = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const DEFAULT_OPTIONS = {
    clientId: "",
    clientSecret: "",
    storeHash: "",
    baseURL: "https://login.bigcommerce.com",
    timeout: 60000,
    maxRetries: 5,
    retryDelay: 5000,
};
class BigCommerceOAuthClient {
    constructor(options) {
        this.options = options;
        this.options = Object.assign(DEFAULT_OPTIONS, this.options);
        this.axiosInstance = axios_1.default.create({
            baseURL: this.options.baseURL,
            timeout: this.options.timeout,
            headers: {
                "Content-Type": "application/json",
                Accept: `application/json`,
            },
        });
    }
    authorize(oauthCode, redirectUri) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = Object.assign({
                client_id: this.options.clientId,
                client_secret: this.options.clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }, oauthCode);
            let retries = 0;
            while (true) {
                try {
                    const response = yield this.axiosInstance.post("/oauth2/token", payload);
                    return response.data;
                }
                catch (error) {
                    if (retries < (this.options.maxRetries || 0) &&
                        (error.response.status === 429 || // rate limit
                            error.response.status >= 500) // BigCommerce API down
                    ) {
                        // retry if the error is recoverable
                        let retryDelay = retries * (this.options.retryDelay || 0);
                        if (error.response.status === 429) {
                            retryDelay = parseInt(error.response.headers["X-Rate-Limit-Time-Reset-Ms"] || retryDelay, 10);
                        }
                        retries++;
                        console.error(`Failed to call /oauth2/token, retrying for ${retries} time`, error);
                        yield new Promise((resolve) => setTimeout(resolve, retryDelay));
                        continue;
                    }
                    else {
                        // throw the unrecoverable error
                        const request = error.request;
                        const response = error.response;
                        if (request && response) {
                            throw new Error(`Failed to call API ${request.protocol}://${request.host}${request.path}. Response Status: ${response.status}, Response: ${JSON.stringify(response.data, null, 0)}.`, { cause: error });
                        }
                        if (request && error.code === "ECONNABORTED") {
                            throw new Error(`Failed to call API ${request.protocol}://${request.host}${request.path}. Timeout after ${this.options.timeout} ms.`, { cause: error });
                        }
                        throw error;
                    }
                }
            }
        });
    }
    verifyStoreAdminJwt(token) {
        return jsonwebtoken_1.default.verify(token, this.options.clientSecret, {
            algorithms: ["HS256"],
            audience: this.options.clientId,
        });
    }
    verifyCustomerJwt(token) {
        return jsonwebtoken_1.default.verify(token, this.options.clientSecret, {
            algorithms: ["HS256"],
            audience: this.options.clientId,
        });
    }
    createCustomerLoginJwt(customerId, redirectUrl, channelId = 1) {
        const payload = {
            iss: this.options.clientId,
            iat: Math.floor(Date.now() / 1000),
            operation: "customer_login",
            store_hash: this.options.storeHash || "",
            customer_id: customerId,
            channel_id: channelId,
            jti: (0, uuid_1.v4)(),
        };
        if (redirectUrl) {
            payload.redirect_url = redirectUrl;
        }
        return jsonwebtoken_1.default.sign(payload, this.options.clientSecret, {
            expiresIn: "24h",
            algorithm: "HS256",
        });
    }
}
exports.BigCommerceOAuthClient = BigCommerceOAuthClient;
