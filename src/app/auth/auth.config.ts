import { PassedInitialConfig } from 'angular-auth-oidc-client';
import {environment} from '../../environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
            authority: `${environment.cognitoAuthorityUrl}/${environment.cognitoUsersPoolId}`,
            redirectUrl: `${environment.remoteHostname}/after-login`,
            postLogoutRedirectUri: window.location.origin,
            clientId: environment.clientId,
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
