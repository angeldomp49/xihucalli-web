# Session Management System

## Overview

The Session Management System provides a comprehensive solution for managing user authentication sessions in the application. It handles the complete lifecycle of user sessions including automatic token refresh, session expiration detection, and secure logout functionality.

## Features

- **Automatic Token Refresh**: Automatically refreshes access tokens before they expire
- **Session Expiration Detection**: Monitors session validity and handles expired sessions gracefully
- **Secure Logout**: Properly cleans up all session data and tokens
- **Force Logout**: Handles forced logout scenarios with reason tracking
- **Session State Management**: Maintains authentication state throughout the application

## Architecture

The Session Management System consists of four main components:

### 1. TokenStorageService
Manages secure storage and retrieval of authentication tokens.

**Key Methods:**
- `storeToken(token: string)`: Store access token
- `storeRefreshToken(refreshToken: string)`: Store refresh token
- `getToken()`: Retrieve current access token
- `getRefreshToken()`: Retrieve refresh token
- `clearTokens()`: Remove all stored tokens
- `isTokenValid()`: Check if current token is valid
- `getTokenExpirationTime()`: Get token expiration timestamp
- `isTokenExpiringSoon(bufferSeconds)`: Check if token will expire soon

### 2. TokenRefreshService
Handles automatic token refresh and renewal.

**Key Methods:**
- `refreshToken()`: Manually refresh the access token
- `startAutoRefresh()`: Begin automatic token refresh monitoring
- `stopAutoRefresh()`: Stop automatic token refresh

**Behavior:**
- Automatically refreshes tokens 5 minutes before expiration
- Handles refresh failures by clearing tokens and triggering logout
- Reschedules next refresh after successful token renewal

### 3. SessionExpirationDetector
Monitors session validity and detects expired sessions.

**Key Methods:**
- `startMonitoring()`: Begin session expiration monitoring
- `stopMonitoring()`: Stop session expiration monitoring

**Behavior:**
- Checks session validity every 60 seconds
- Redirects to login page when session expires
- Adds `sessionExpired=true` query parameter for user feedback

### 4. SessionManagementService
Orchestrates all session management operations.

**Key Methods:**
- `login(token, refreshToken?)`: Initialize new user session
- `logout()`: End user session and clean up
- `forceLogout(reason?)`: Force logout with optional reason
- `isAuthenticated()`: Check current authentication status
- `getUserEmail()`: Get authenticated user's email
- `getUserId()`: Get authenticated user's ID
- `getUsername()`: Get authenticated user's username

**Observables:**
- `isAuthenticated$`: Observable stream of authentication status

## Usage Examples

### Example 1: Basic Login Flow

```typescript
import { Component, inject } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-login',
  template: '...'
})
export class LoginComponent {
  private sessionManagement = inject(SessionManagementService);

  handleSuccessfulLogin(accessToken: string, refreshToken: string): void {
    this.sessionManagement.login(accessToken, refreshToken);
  }
}
```

### Example 2: Logout

```typescript
import { Component, inject } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-user-menu',
  template: '...'
})
export class UserMenuComponent {
  private sessionManagement = inject(SessionManagementService);

  handleLogout(): void {
    this.sessionManagement.logout();
  }
}
```

### Example 3: Check Authentication Status

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-dashboard',
  template: '...'
})
export class DashboardComponent implements OnInit {
  private sessionManagement = inject(SessionManagementService);
  isAuthenticated = false;

  ngOnInit(): void {
    this.sessionManagement.isAuthenticated$.subscribe(
      authenticated => this.isAuthenticated = authenticated
    );
  }
}
```

### Example 4: Display User Information

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { SessionManagementService } from '@commons/session';

@Component({
  selector: 'app-user-profile',
  template: '...'
})
export class UserProfileComponent implements OnInit {
  private sessionManagement = inject(SessionManagementService);
  userEmail: string | null = null;
  username: string | null = null;

  ngOnInit(): void {
    this.userEmail = this.sessionManagement.getUserEmail();
    this.username = this.sessionManagement.getUsername();
  }
}
```

### Example 5: Manual Token Refresh

```typescript
import { Component, inject } from '@angular/core';
import { TokenRefreshService } from '@commons/session';

@Component({
  selector: 'app-settings',
  template: '...'
})
export class SettingsComponent {
  private tokenRefresh = inject(TokenRefreshService);

  refreshSession(): void {
    this.tokenRefresh.refreshToken().subscribe({
      next: () => console.log('Token refreshed successfully'),
      error: (error) => console.error('Token refresh failed', error)
    });
  }
}
```

## HTTP Interceptor Integration

The `AuthInterceptor` automatically:
- Attaches JWT tokens to authenticated requests
- Detects 401 Unauthorized responses
- Triggers forced logout on authentication failures
- Cleans up invalid or expired tokens

No additional configuration is required once the interceptor is registered in the application providers.

## Session Lifecycle

1. **Session Initialization** (Login)
   - Store access and refresh tokens
   - Start automatic token refresh
   - Begin session expiration monitoring
   - Update authentication state

2. **Active Session**
   - Monitor token expiration (every 60 seconds)
   - Auto-refresh token (5 minutes before expiration)
   - Intercept HTTP requests with token
   - Handle 401 errors with forced logout

3. **Session Termination** (Logout)
   - Stop token refresh monitoring
   - Stop expiration detection
   - Clear all stored tokens
   - Reset authentication state
   - Redirect to login page

## Configuration

The system uses environment configuration:

```typescript
export const environment = {
  isAuthenticationEnabled: true,
  xihucalliAuthAPIHostname: 'https://api.example.com',
  loginEndpoint: '/login-check'
};
```

## Security Considerations

- Tokens are stored in `localStorage` for persistence
- Tokens are automatically cleared on expiration or error
- Refresh tokens are used to obtain new access tokens
- All session cleanup operations are thorough and secure
- 401 responses trigger immediate session termination

## Error Handling

The system handles various error scenarios:

- **Invalid Token**: Automatically cleared and user redirected to login
- **Expired Token**: Detected and session terminated gracefully
- **Refresh Failure**: Tokens cleared and forced logout initiated
- **Network Errors**: Propagated to caller for handling
- **401 Unauthorized**: Immediate forced logout with session cleanup

## Best Practices

1. Always use `SessionManagementService` for login/logout operations
2. Subscribe to `isAuthenticated$` for reactive authentication state
3. Let automatic token refresh handle token renewal
4. Don't manually manage tokens unless absolutely necessary
5. Use `forceLogout()` with reasons for audit trails
6. Handle session expiration gracefully in the UI

