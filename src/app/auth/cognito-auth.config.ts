import {PassedInitialConfig} from 'angular-auth-oidc-client';
import {environment} from '../../environments/environment';
import {IDENTITY_PROVIDER_COGNITO} from '../../commons/session/authentication/identity_providers/values';

export const cognitoAuthConfig: PassedInitialConfig = {
  config: {
    configId: IDENTITY_PROVIDER_COGNITO,
    authority: `${environment.cognitoAuthorityUrl}/${environment.cognitoUsersPoolId}`,
    redirectUrl: `${environment.remoteHostname}/after-login`,
    postLogoutRedirectUri: window.location.origin,
    clientId: environment.cognitoClientId,
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
