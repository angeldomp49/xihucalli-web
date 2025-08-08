import {BehaviorSubject, delay, Observable, of, tap, map} from 'rxjs';
import {Router} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {AuthenticatedResult, LoginResponse, OidcSecurityService} from 'angular-auth-oidc-client';
import { sha256 } from 'js-sha256';

@Injectable({
  providedIn: 'root'
})
export class OpenIDAuthenticationService {

  private readonly oidcSecurityService = inject(OidcSecurityService);

  configuration$ = this.oidcSecurityService.getConfiguration();

  userData$ = this.oidcSecurityService.userData$;

  isAuthenticated: boolean = false;

  private readonly LOGOUT_URL = 'http://xihucalli-web-hosting.s3-website.us-east-2.amazonaws.com/logout';

  private _onRedirectToLogin: () => void = () => {};


  public setOnRedirectToLogin(fn: () => void): void {
    this._onRedirectToLogin = fn;
  }

  public login(): void {
    this.oidcSecurityService.authorize();
  }

  public completeAuthenticationProcess(): Observable<LoginResponse> {
    return this.oidcSecurityService.checkAuth();
  }

  logout(): void {

    if (window.sessionStorage) {
      window.sessionStorage.clear();
    }

    const logoutUrl = new URL("https://us-east-2nqexgbsjn.auth.us-east-2.amazoncognito.com/logout");
    logoutUrl.searchParams.set("client_id", "gr885242sskiqospietec1kt7");
    logoutUrl.searchParams.set("logout_uri", this.LOGOUT_URL);

    window.location.href = logoutUrl.toString();
  }

  public performAuthCheck(): Observable<boolean> {
    return this.oidcSecurityService
      .checkAuth()
      .pipe(
        map((loginResponse: LoginResponse) => {

          this.isAuthenticated = loginResponse.isAuthenticated;
          console.log(loginResponse);
          console.warn('authenticated: ', this.isAuthenticated);

          if(!this.isAuthenticated) {
            this._onRedirectToLogin();
            return this.isAuthenticated;
          }

          return this.isAuthenticated;
        })
      );
  }

  public readAuthenticationAccessToken(): Observable<string>{
    return this.oidcSecurityService.getAccessToken();
  }

}
