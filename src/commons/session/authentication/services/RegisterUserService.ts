import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RegisterUserRequest {
  register_user_operation_id: string;
  client_choice?: 'ACCEPT' | 'REJECT';
  profile_display_name?: string;
  profile_username?: string;
}

export interface RegisterUserResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterUserService {
  private readonly baseUrl = `${environment.xihucalliAuthAPIHostname}${environment.authRegisterEndpoint}`;

  constructor(private readonly http: HttpClient) {}

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

    return this.http.post<RegisterUserResponse>(this.baseUrl, null, { params });
  }

  registerNewUser(operationId: string, displayName: string, username: string): Observable<RegisterUserResponse> {
    return this.registerUser({
      register_user_operation_id: operationId,
      profile_display_name: displayName,
      profile_username: username
    });
  }

  acceptLinkAccount(operationId: string): Observable<RegisterUserResponse> {
    return this.registerUser({
      register_user_operation_id: operationId,
      client_choice: 'ACCEPT'
    });
  }

  rejectLinkAccount(operationId: string, displayName: string, username: string): Observable<RegisterUserResponse> {
    return this.registerUser({
      register_user_operation_id: operationId,
      client_choice: 'REJECT',
      profile_display_name: displayName,
      profile_username: username
    });
  }
}

