import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthInitiateResponse } from '../types/AuthInitiateResponse';
import { RegisterUserRequest } from '../types/RegisterUserRequest';
import { RegisterUserResponse } from '../types/RegisterUserResponse';
import { OpenIDProvider } from '../types/OpenIDProvider';

@Injectable({
  providedIn: 'root'
})
export class OpenIDAuthenticationService {
  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = environment.xihucalliAuthAPIHostname;
  }

  initiateAuthentication(provider: OpenIDProvider): Observable<AuthInitiateResponse> {
    const params = new HttpParams()
      .set('provider', provider)
      .set('redirect_url', environment.callbackRedirectUrl);

    const url = `${this.baseUrl}${environment.authInitiateEndpoint}`;

    return this.http.get<AuthInitiateResponse>(url, { params });
  }

  registerUser(request: RegisterUserRequest): Observable<RegisterUserResponse> {
    let params = new HttpParams()
      .set('register_user_operation_id', request.register_user_operation_id);

    if (request.client_choice) {
      params = params.set('client_choice', request.client_choice);
    }

    if (request.profile_display_name) {
      params = params.set('profile_display_name', request.profile_display_name);
    }

    if (request.profile_username) {
      params = params.set('profile_username', request.profile_username);
    }

    const url = `${this.baseUrl}${environment.authRegisterEndpoint}`;

    return this.http.post<RegisterUserResponse>(url, null, { params });
  }

  redirectToProvider(authorizationUrl: string): void {
    window.location.href = authorizationUrl;
  }
}

