import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub?: string;
  email?: string;
  username?: string;
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'xihucalli_access_token';
  private readonly REFRESH_TOKEN_KEY = 'xihucalli_refresh_token';

  storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  storeRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenValid(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (!decoded.exp) {
        return false;
      }

      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getTokenPayload(): JwtPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      return null;
    }
  }

  getUserEmail(): string | null {
    const payload = this.getTokenPayload();
    return payload?.email || null;
  }

  getUserId(): string | null {
    const payload = this.getTokenPayload();
    return payload?.sub || null;
  }

  getUsername(): string | null {
    const payload = this.getTokenPayload();
    return payload?.username || null;
  }
}
export interface AuthInitiateResponse {
  authorization_url: string;
  state: string;
  provider: string;
  redirect_url: string;
}

