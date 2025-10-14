import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {OpenIDAuthenticationService} from '../session/authentication/OpenIDAuthenticationService';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiHttpClient {

  private readonly apiUrl: string = environment.apiUrl;

  public constructor(private http: HttpClient, private openIDAuthenticationService: OpenIDAuthenticationService) {}

  public getRequestToResource(resourcePath: string): Observable<any>{

    if(!environment.isAuthenticationEnabled){
      return this.getRequestToResourceNoAuthentication(resourcePath);
    }

    return this.getRequesToResourceWithAuthentication(resourcePath);

  }

  private getRequesToResourceWithAuthentication(resourcePath: string) {
    return new Observable<any>(observer =>

      this.openIDAuthenticationService
        .readAuthenticationAccessToken()
        .subscribe(accessToken =>

          this.http
            .get<string>(this.apiUrl + resourcePath, {
              headers: {
                "Authorization": "Bearer " + accessToken,
                "Access-Control-Allow-Origin": "*"
              }
            })
            .subscribe(flatResponse => observer.next(flatResponse))
        )
    );
  }

  private getRequestToResourceNoAuthentication(resourcePath: string): Observable<any>{
    return new Observable<any>(observer =>

      this.http
        .get<string>( this.apiUrl +  resourcePath, {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }})
        .subscribe( flatResponse => observer.next(flatResponse))
    );
  }

  public postToResource(resourcePath: string, body: string): Observable<any>{

    if(!environment.isAuthenticationEnabled){
      return this.postToResourceNoAuthentication(resourcePath, body);
    }

    return this.postToResourceWithAuthentication(resourcePath, body);

  }

  public postToResourceNoAuthentication(resourcePath: string, body: string): Observable<any>{
    return new Observable<any>(observer =>

      this.http
        .post<string>( this.apiUrl + resourcePath, body, {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        })
        .subscribe(flatResponse => observer.next(flatResponse))
    );
  }

  public postToResourceWithAuthentication(resourcePath: string, body: string): Observable<any>{
    return new Observable<any>(observer =>

      this.openIDAuthenticationService
        .readAuthenticationAccessToken()
        .subscribe(accessToken =>

          this.http
            .post<string>( this.apiUrl + resourcePath, body, {
              headers: {
                "Authorization": "Bearer " + accessToken,
                "Access-Control-Allow-Origin": "*"
              }
            })
            .subscribe(flatResponse => observer.next(flatResponse))
        )
    );
  }

}
