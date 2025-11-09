import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { OpenIDAuthenticationService } from '../openid/OpenIDAuthenticationService';
import { SessionManagementService } from '../../management/SessionManagementService';
import { OpenIDProvider } from '../types/OpenIDProvider';
import { RegisterUserRequest } from '../types/RegisterUserRequest';
import { RegisterUserResponse } from '../types/RegisterUserResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationOrchestrationService {
  constructor(
    private readonly openIDService: OpenIDAuthenticationService,
    private readonly sessionService: SessionManagementService,
    private readonly router: Router
  ) {}

  startAuthenticationFlow(provider: OpenIDProvider): void {
    this.openIDService.initiateAuthentication(provider)
      .pipe(
        tap(response => {
          this.openIDService.redirectToProvider(response.authorization_url);
        }),
        catchError(error => {
          console.error('Authentication initiation failed', error);
          this.router.navigate(['/login-check'], {
            queryParams: { error: 'Failed to initiate authentication' }
          });
          return of(null);
        })
      )
      .subscribe();
  }

  completeRegistration(request: RegisterUserRequest): Observable<RegisterUserResponse> {
    return this.openIDService.registerUser(request)
      .pipe(
        tap(response => {
          this.sessionService.login(response.token);
        })
      );
  }

  logout(): void {
    this.sessionService.logout();
  }

  isAuthenticated(): boolean {
    return this.sessionService.isAuthenticated();
  }
}

