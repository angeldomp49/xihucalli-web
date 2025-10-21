import {map, Observable, Observer, switchMap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';
import {Optional} from '../../../Optional';
import {OpenIDIdentityProviderSelector} from '../identity_providers/OpenIDIdentityProviderSelector';

@Injectable({
  providedIn: 'root'
})
export class XihucalliAuthenticationService {

  private readonly XIHUCALLI_API_SESSION_CHECK_URI = "/check-session"
  private readonly XIHUCALLI_API_TOKEN_EXCHANGE_URI = "/token-exchange"
  private readonly XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY"

  private _onRedirectToLogin: () => void = () => {};

  public constructor(
    private httpClient: HttpClient,
    private providerSelector: OpenIDIdentityProviderSelector
  ) {
  }

  public setOnRedirectToLogin(fn: () => void): void {
    this._onRedirectToLogin = fn;
  }

  public performSessionValidityCheck(): Observable<boolean> {

    const xihucalliAccessToken = localStorage.getItem(this.XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

    if (xihucalliAccessToken == null) {
      return new Observable<boolean>((observer: Observer<boolean>) => {
        console.warn("Not found xihucalli access token for current session.")
        observer.next(false);
      })
    }

    return this.httpClient.get<XihucalliAuthResponse>(
      environment.xihucalliAuthAPIHostname + this.XIHUCALLI_API_SESSION_CHECK_URI,
      {
        headers: {
          "Authorization": xihucalliAccessToken,
          "X-Client-ID": environment.xihucalliClientID
        }
      }
    )
      .pipe(
        map((checkResponse: XihucalliAuthResponse) => {

          if (!checkResponse.isAuthenticated) {
            this._onRedirectToLogin();
          }

          return checkResponse.isAuthenticated;

        })
      )

  }

  public readAccessToken(): Observable<Optional<string|null>> {

    const xihucalliAccessToken = localStorage.getItem(this.XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

    return new Observable<Optional<string|null>>(observer => {
      observer.next(
        Optional.of(xihucalliAccessToken)
      )
    })
  }

  public performTokenExchange(): Observable<XihucalliTokenResponse> {

    const provider = this.providerSelector.getProvider().value();

    if (!provider) {
      throw new Error('No identity provider selected');
    }

    return provider.readAccessToken().pipe(
      switchMap(accessTokenOptional => {
        const accessToken = accessTokenOptional.value();

        const headers: any = {
          "X-Client-ID": environment.xihucalliClientID,
          "Authorization": accessToken,
          "X-Identity-Provider": provider.getIdentityProviderName()
        };

        return this.httpClient.get<XihucalliTokenResponse>(
          environment.xihucalliAuthAPIHostname + this.XIHUCALLI_API_TOKEN_EXCHANGE_URI, {
            headers: headers
          }
        ).pipe(
          map((tokenResponse: XihucalliTokenResponse) => {
            localStorage.setItem(this.XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY, tokenResponse.accessToken)

            return tokenResponse;
          })
        );
      })
    );

  }

}

export type XihucalliAuthResponse = {
  isAuthenticated: boolean;
  userData: any;
  accessToken: string;
}

export type XihucalliTokenResponse = {
  accessToken: string;
}
