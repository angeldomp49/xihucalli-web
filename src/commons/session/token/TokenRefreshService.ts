import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, timer, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './TokenStorageService';

interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private refreshTimerSubscription?: Subscription;
  private readonly REFRESH_BUFFER_SECONDS = 300;

  refreshToken(): Observable<TokenRefreshResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<TokenRefreshResponse>(
      `${environment.xihucalliAuthAPIHostname}/auth/refresh`,
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => this.handleRefreshSuccess(response)),
      catchError(error => this.handleRefreshError(error))
    );
  }

  startAutoRefresh(): void {
    this.stopAutoRefresh();

    const expirationTime = this.tokenStorage.getTokenExpirationTime();

    if (!expirationTime) {
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilRefresh = (expirationTime - currentTime - this.REFRESH_BUFFER_SECONDS) * 1000;

    if (timeUntilRefresh <= 0) {
      this.refreshToken().subscribe();
      return;
    }

    this.refreshTimerSubscription = timer(timeUntilRefresh).pipe(
      switchMap(() => this.refreshToken())
    ).subscribe();
  }

  stopAutoRefresh(): void {
    if (this.refreshTimerSubscription) {
      this.refreshTimerSubscription.unsubscribe();
      this.refreshTimerSubscription = undefined;
    }
  }

  private handleRefreshSuccess(response: TokenRefreshResponse): void {
    this.tokenStorage.storeToken(response.access_token);

    if (response.refresh_token) {
      this.tokenStorage.storeRefreshToken(response.refresh_token);
    }

    this.startAutoRefresh();
  }

  private handleRefreshError(error: any): Observable<never> {
    this.tokenStorage.clearTokens();
    this.stopAutoRefresh();
    return throwError(() => error);
  }
}

