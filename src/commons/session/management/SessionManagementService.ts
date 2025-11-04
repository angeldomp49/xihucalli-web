import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenStorageService } from '../token/TokenStorageService';

@Injectable({
  providedIn: 'root'
})
export class SessionManagementService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {
    this.checkInitialAuthentication();
  }

  private checkInitialAuthentication(): void {
    const isValid = this.tokenStorage.isTokenValid();
    this.isAuthenticatedSubject.next(isValid);
  }

  login(token: string): void {
    this.tokenStorage.storeToken(token);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    this.tokenStorage.clearTokens();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login-check']);
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
}

