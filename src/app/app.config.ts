import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {cognitoAuthConfig} from './auth/cognito-auth.config';
import {googleAuthConfig} from './auth/google-auth.config';
import {provideAuth} from 'angular-auth-oidc-client';
import {provideHttpClient} from '@angular/common/http';

const combinedAuthConfig = {
  config: [
    cognitoAuthConfig.config,
    googleAuthConfig.config
  ]
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAuth(combinedAuthConfig as any),
    provideHttpClient()
  ]
};
