import {inject, Injectable} from '@angular/core';
import {LoginResponse, OidcSecurityService} from 'angular-auth-oidc-client';
import {map, Observable} from 'rxjs';
import {IDENTITY_PROVIDER_COGNITO} from '../identity_providers/values';
import {OpenIDIdentityProvider} from '../identity_providers/OpenIDIdentityProvider';
import {Optional} from '../../../Optional';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CognitoOpenIDAuthenticationService implements OpenIDIdentityProvider {

  isAuthenticated: boolean = false;
  private readonly oidcSecurityService = inject(OidcSecurityService);
  configuration$ = this.oidcSecurityService.getConfiguration(IDENTITY_PROVIDER_COGNITO);
  userData$ = this.oidcSecurityService.getUserData(IDENTITY_PROVIDER_COGNITO);
  private readonly LOGOUT_URL = 'http://xihucalli-web-hosting.s3-website.us-east-2.amazonaws.com/logout';
  private readonly COGNITO_START_LOGOUT_URL = '"https://us-east-2_kZeUTI40G.auth.us-east-2.amazoncognito.com/logout"';

  public setOnRedirectToLogin(fn: () => void): void {
    this._onRedirectToLogin = fn;
  }

  public login(): void {
    this.oidcSecurityService.authorize(IDENTITY_PROVIDER_COGNITO);
  }

  public completeAuthentication(): Observable<void> {
    return new Observable(observer =>
      this.oidcSecurityService
        .checkAuth(window.location.href, IDENTITY_PROVIDER_COGNITO)
        .subscribe( response =>
          observer.next()
         )
    )
  }

  logout(): void {

    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }

    const logoutUrl = new URL(this.COGNITO_START_LOGOUT_URL);
    logoutUrl.searchParams.set("client_id", environment.cognitoClientId);
    logoutUrl.searchParams.set("logout_uri", this.LOGOUT_URL);

    window.location.href = logoutUrl.toString();
  }

  public performSessionValidityCheck(): Observable<boolean> {
    return this.oidcSecurityService
      .checkAuth(IDENTITY_PROVIDER_COGNITO)
      .pipe(
        map((loginResponse: LoginResponse) => {

          this.isAuthenticated = loginResponse.isAuthenticated;
          console.log(loginResponse);
          console.warn('authenticated: ', this.isAuthenticated);

          if (!this.isAuthenticated) {
            this._onRedirectToLogin();
          }

          return this.isAuthenticated;
        })
      );
  }

  public readAccessToken(): Observable<Optional<string | null>> {
    return this.oidcSecurityService
      .getAccessToken(IDENTITY_PROVIDER_COGNITO)
      .pipe(map( token => Optional.of(token)))
  }

  public getIdentityProviderName(): string {
    return IDENTITY_PROVIDER_COGNITO;
  }

  private _onRedirectToLogin: () => void = () => {
  };

}
