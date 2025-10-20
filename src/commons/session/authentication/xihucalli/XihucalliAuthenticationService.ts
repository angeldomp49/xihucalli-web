import {map, Observable, Observer} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';
import {IDENTITY_PROVIDER_COGNITO, IDENTITY_PROVIDER_FACEBOOK, IDENTITY_PROVIDER_GOOGLE} from '../../../../app/globals';
import {getCognitoAccessToken, getFacebookAccessToken, getGoogleAccessToken} from './tokenStorage';

@Injectable({
  providedIn: 'root'
})
export class XihucalliAuthenticationService {

  private readonly XIHUCALLI_API_SESSION_CHECK_URI = "/check-session"
  private readonly XIHUCALLI_API_TOKEN_EXCHANGE_URI = "/token-exchange"
  private readonly XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY"

    private _onRedirectToLogin: () => void = () => {};

    public constructor(
      private httpClient: HttpClient
    ) {}

    public setOnRedirectToLogin(fn: () => void): void {
      this._onRedirectToLogin = fn;
    }

    public performAuthCheck(): Observable<boolean>{

      const xihucalliAccessToken = localStorage.getItem(this.XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

      if(xihucalliAccessToken == null){
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
          map( (checkResponse : XihucalliAuthResponse) => {

            if(!checkResponse.isAuthenticated){
              this._onRedirectToLogin();
            }

            return checkResponse.isAuthenticated;

          })
        )

    }

    public performTokenExchange(idpName: string): Observable<XihucalliTokenResponse>{
      let headers: any = {
        "X-Client-ID": environment.xihucalliClientID,
      };

      switch(idpName){
        case IDENTITY_PROVIDER_COGNITO:
          headers = {
            "Authorization": getCognitoAccessToken(),
            "X-Identity-Provider": IDENTITY_PROVIDER_COGNITO,
            ...headers
          }
        break;
        case IDENTITY_PROVIDER_FACEBOOK:
          headers = {
          "Authorization": getFacebookAccessToken(),
          "X-Identity-Provider": IDENTITY_PROVIDER_FACEBOOK,
          ...headers
        }
        break;
        case IDENTITY_PROVIDER_GOOGLE:
        headers = {
          "Authorization": getGoogleAccessToken(),
          "X-Identity-Provider": IDENTITY_PROVIDER_GOOGLE,
          ...headers
        }
        break;
      }

      return this.httpClient.get<XihucalliTokenResponse>(
        environment.xihucalliAuthAPIHostname + this.XIHUCALLI_API_TOKEN_EXCHANGE_URI, {
          headers: headers
        }
      ).pipe(
        map((tokenResponse: XihucalliTokenResponse) => {
          localStorage.setItem(this.XIHUCALLI_ACCESS_TOKEN_LOCAL_STORAGE_KEY, tokenResponse.accessToken)

          return tokenResponse;
        })
      )

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
