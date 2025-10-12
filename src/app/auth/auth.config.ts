import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
            authority: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_kZeUTI40G',
            redirectUrl: "https://d280b0wq9js4xf.cloudfront.net/after-login",
            postLogoutRedirectUri: window.location.origin,
            clientId: '1t71utkcgnhjmjm7c0fr6f54po',
            usePushedAuthorisationRequests: false,
            scope: 'email openid profile',
            responseType: 'code',
            silentRenew: true,
            useRefreshToken: true,
            ignoreNonceAfterRefresh: true,
            customParamsAuthRequest: {
              prompt: 'consent',
            },
    }
}
