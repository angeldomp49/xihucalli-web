import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenStorageService } from '../token/TokenStorageService';
import { TokenRefreshService } from '../token/TokenRefreshService';
import { SessionExpirationDetector } from './SessionExpirationDetector';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionManagementService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(
    private readonly tokenStorage: TokenStorageService,
    private readonly tokenRefresh: TokenRefreshService,
    private readonly expirationDetector: SessionExpirationDetector,
    private readonly router: Router
  ) {
    this.checkInitialAuthentication();
  }

  private checkInitialAuthentication(): void {
    const isValid = this.tokenStorage.isTokenValid();
    this.isAuthenticatedSubject.next(isValid);

    if (isValid) {
      this.initializeSession();
    }
  }

  login(token: string, refreshToken?: string): void {
    this.tokenStorage.storeToken(token);

    if (refreshToken) {
      this.tokenStorage.storeRefreshToken(refreshToken);
    }

    this.isAuthenticatedSubject.next(true);
    this.initializeSession();
  }

  logout(): void {
    this.cleanupSession();
    this.tokenStorage.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate([environment.loginEndpoint]);
  }

  forceLogout(reason?: string): void {
    this.cleanupSession();
    this.tokenStorage.clearTokens();
    this.isAuthenticatedSubject.next(false);

    const queryParams = reason ? { reason } : {};
    this.router.navigate([environment.loginEndpoint], { queryParams });
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isTokenValid();
  }

  getUserEmail(): string | null {
    return this.tokenStorage.getUserEmail();
  }

  getUserId(): string | null {
    return this.tokenStorage.getUserId();
  }

  getUsername(): string | null {
    return this.tokenStorage.getUsername();
  }

  private initializeSession(): void {
    if (environment.isAuthenticationEnabled) {
      this.tokenRefresh.startAutoRefresh();
      this.expirationDetector.startMonitoring();
    }
  }

  private cleanupSession(): void {
    this.tokenRefresh.stopAutoRefresh();
    this.expirationDetector.stopMonitoring();
  }
}

