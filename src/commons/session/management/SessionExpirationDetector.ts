import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { TokenStorageService } from '../token/TokenStorageService';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionExpirationDetector {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private expirationCheckSubscription?: Subscription;
  private readonly CHECK_INTERVAL_MS = 60000;

  startMonitoring(): void {
    this.stopMonitoring();

    this.expirationCheckSubscription = interval(this.CHECK_INTERVAL_MS).subscribe(() => {
      this.checkSessionExpiration();
    });
  }

  stopMonitoring(): void {
    if (this.expirationCheckSubscription) {
      this.expirationCheckSubscription.unsubscribe();
      this.expirationCheckSubscription = undefined;
    }
  }

  private checkSessionExpiration(): void {
    const isValid = this.tokenStorage.isTokenValid();

    if (!isValid) {
      this.handleSessionExpired();
    }
  }

  private handleSessionExpired(): void {
    this.tokenStorage.clearTokens();
    this.stopMonitoring();
    this.router.navigate([environment.loginEndpoint], {
      queryParams: { sessionExpired: 'true' }
    });
  }
}

