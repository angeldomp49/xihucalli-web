import {PassedInitialConfig} from 'angular-auth-oidc-client';
import {environment} from '../../environments/environment';

export const googleAuthConfig: PassedInitialConfig = {
  config: {
    authority: 'https://accounts.google.com',
    redirectUrl: `${environment.remoteHostname}/after-login`,
    postLogoutRedirectUri: window.location.origin,
    clientId: environment.googleClientId,
    scope: 'openid profile email',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    autoUserInfo: true,
    customParamsAuthRequest: {
      prompt: 'consent',
    },
  }
}

