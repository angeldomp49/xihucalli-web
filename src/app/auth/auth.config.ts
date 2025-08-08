import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
            authority: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_nQexGbSJn',
            redirectUrl: "https://d280b0wq9js4xf.cloudfront.net/after-login",
            postLogoutRedirectUri: window.location.origin,
            clientId: 'gr885242sskiqospietec1kt7',
            usePushedAuthorisationRequests: false,
            scope: 'email openid phone',
            responseType: 'code',
            silentRenew: true,
            useRefreshToken: true,
            ignoreNonceAfterRefresh: true,
            customParamsAuthRequest: {
              prompt: 'consent',
            },
    }
}
