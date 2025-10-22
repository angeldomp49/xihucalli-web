import {inject, Injectable} from '@angular/core';
import {LoginResponse, OidcSecurityService} from 'angular-auth-oidc-client';
import {map, Observable} from 'rxjs';
import {OpenIDIdentityProvider} from '../identity_providers/OpenIDIdentityProvider';
import {Optional} from '../../../Optional';
import {IDENTITY_PROVIDER_GOOGLE} from '../identity_providers/values';

@Injectable({
  providedIn: 'root'
})
export class GoogleOpenIDAuthenticationService implements OpenIDIdentityProvider {

  private readonly oidcSecurityService = inject(OidcSecurityService);

  configuration$ = this.oidcSecurityService.getConfiguration(IDENTITY_PROVIDER_GOOGLE);

  userData$ = this.oidcSecurityService.getUserData(IDENTITY_PROVIDER_GOOGLE);

  isAuthenticated: boolean = false;

  private _onRedirectToLogin: () => void = () => {};

  public setOnRedirectToLogin(fn: () => void): void {
    this._onRedirectToLogin = fn;
  }

  public login(): void {
    this.oidcSecurityService.authorize(IDENTITY_PROVIDER_GOOGLE);
  }

  public completeAuthentication(): Observable<void> {
    return new Observable(observer =>
      this.oidcSecurityService
        .checkAuth(window.location.href, IDENTITY_PROVIDER_GOOGLE)
        .subscribe( response =>
          observer.next()
        )
    );
  }

  logout(): void {
    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }
    this.oidcSecurityService.logoff(IDENTITY_PROVIDER_GOOGLE).subscribe();
  }

  public performSessionValidityCheck(): Observable<boolean> {
    return this.oidcSecurityService
      .checkAuth(window.location.href, IDENTITY_PROVIDER_GOOGLE)
      .pipe(
        map((loginResponse: LoginResponse) => {

          this.isAuthenticated = loginResponse.isAuthenticated;
          console.log(loginResponse);
          console.warn('authenticated: ', this.isAuthenticated);

          if(!this.isAuthenticated) {
            this._onRedirectToLogin();
          }

          return this.isAuthenticated;
        })
      );
  }

  public readAccessToken(): Observable<Optional<string|null>>{
    return this.oidcSecurityService
      .getAccessToken(IDENTITY_PROVIDER_GOOGLE)
      .pipe(map( token => Optional.of(token)));
  }

  public getIdentityProviderName(): string {
    return IDENTITY_PROVIDER_GOOGLE;
  }

}
