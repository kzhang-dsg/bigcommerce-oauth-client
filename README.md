# BigCommerce OAuth Client

A TypeScript NodeJS Oauth client for BigCommerce App development. Handles BigCommerce App's Oauth flow for app installation, app load, verify current customer jwt, and generate customer login jwt.

- [BigCommerce OAuth Client](#bigcommerce-oauth-client)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
  - [Configuration](#configuration)
  - [Error Handling](#error-handling)
  - [Versioning](#versioning)
  - [Support](#support)
  - [License](#license)


## Getting Started

- [Installation](#installation)
- [Basic Usage](#basic-usage)

## Installation

```sh
npm install bigcommerce-oauth-client --save
```

## Basic Usage

```typescript
import { BigCommerceOAuthClient } from "bigcommerce-oauth-client";
import { AccessToken } from "bigcommerce-oauth-client/lib/model/oauth";

const bigCommerceOAuthClient = new BigCommerceOAuthClient({
    clientId: "xxxxxx",  // replace it with your store hash
    clientSecret: "xxxxxx"  // replace it with your access token
});

// Example code to get products
const accessToken: AccessToken = await bigCommerceOAuthClient.authorize({
    code: "xxxxxx"; // replace it with the parameter in auth call back
    scope: "xxxxxx"; // replace it with the parameter in auth call back
    context: "xxxxxx"; // replace it with the parameter in auth call back
}, "https://auth.callback.uri"); // replace it with the auth callback registered in the app profile.
console.log(JSON.stringify(accessToken));

```

## Configuration

When creating the bigcommerce-oauth-client instance, you can pass in additional configuration:

```typescript
import { BigCommerceOAuthClient } from "bigcommerce-oauth-client";

const bigCommerceOAuthClient = new BigCommerceOAuthClient({
    clientId: "xxxxxx", // replace it with your store hash
    clientSecret: "xxxxxx", // replace it with your access token
    storeHash: "xxxxx", // replace it with your store hash. Only needed for createCustomerLoginJwt()
    baseURL: "https://login.bigcommerce.com", // Optional custom OAuth URL endpoint
    timeout: 60000,  // request timeout. Default is 1 minute
    maxRetries: 5,  // max number of retries. Default is 5
    retryDelay: 5000,  // Wait time before next retry. Default is 5 seconds.
                       // the wait time for each retry is calculated by retryDelay * nthRetry.
                       // For example, if retryDelay=5000 and it is the 3rd retry, then wait for 5000*3=15000 ms.
});

```

Below is the complete list of config parameters:

- `timeout` (default: `60000`)
  - Request timeout. Default is 1 minute
- `maxRetries` (default: `5`)
  - Max number of retries when error happened. Default is 5
- `retryDelay` (default: `5000`)
  - Wait time before next retry. Default is 5 seconds. The wait time for each retry is calculated by `retryDelay * nthRetry`. For example, if `retryDelay = 5000` and it is the 3rd retry, then wait for `5000 * 3 = 15000 ms`. For `429` errors, the wait time is indicated by `X-Rate-Limit-Time-Reset-Ms` response header. See the [BigCommerce Document](https://developer.bigcommerce.com/api-docs/getting-started/best-practices#playing-nicely-with-the-platform) for details.

## Error Handling

bigcommerce-oauth-client throws an error with a friendly error message when

- 4xx error, except for
  - 429 error if `maxRetries` is not reached yet
  - 404 error if `config.failOn404 = false`
- Timeout
- Max retry reached on 429 error and 5XX errors

If you need to get the underlying axios error object, you just need to

```typescript
try {
    // call bigcommerceApiClient
} catch (err) {
    let axiosError = err.cause; // the axios error object is in the error cause
    let request = axiosError.request;
    let response = axiosError.response;
}
```

For more information, see [Axios Error Handling](https://axios-http.com/docs/handling_errors).

## Versioning

This project strictly follows [Semantic Versioning](http://semver.org/).

## Support

If you have a problem with this library, please file an [issue](https://github.com/kzhang-dsg/bigcommerce-oauth-client/issues/new) here on GitHub.


## License

MIT