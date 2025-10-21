import {PassedInitialConfig} from 'angular-auth-oidc-client';
import {environment} from '../../environments/environment';
import {IDENTITY_PROVIDER_GOOGLE} from '../../commons/session/authentication/identity_providers/values';

export const googleAuthConfig: PassedInitialConfig = {
  config: {
    configId: IDENTITY_PROVIDER_GOOGLE,
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
    customParamsCodeRequest:{
      client_secret: 'dummy-client-secret'
    },
    customParamsRefreshTokenRequest:{
      client_secret: 'dummy-client-secret'
    }
  }
}
