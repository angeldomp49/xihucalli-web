# OpenID Authentication Infrastructure - Configuration and Services

This documentation describes the OpenID authentication infrastructure implemented in the Xihucalli application, including configuration, token management, and authentication services.

## Overview

The application uses a custom OpenID authentication flow that integrates with external identity providers (Google and Cognito) through a backend authentication service. The implementation follows Clean Architecture principles and provides a complete authentication lifecycle management.

## Components

### 1. Environment Configuration

The application environment configuration includes OpenID-specific endpoints and settings:

```typescript
// environment.development.ts or environment.ts
{
  xihucalliAuthAPIHostname: 'https://api.example.com/xihucalli/user',
  authInitiateEndpoint: '/auth/initiate',
  authCallbackEndpoint: '/auth/callback',
  authRegisterEndpoint: '/register',
  callbackRedirectUrl: 'https://app.example.com/auth/callback'
}
```

### 2. Token Storage Service

The `TokenStorageService` provides secure storage and management of JWT tokens:

**Features:**
- Store and retrieve access tokens
- Store and retrieve refresh tokens
- Validate token expiration
- Extract token payload information
- Clear tokens on logout

**Usage Example:**

```typescript
import { TokenStorageService } from '@commons/session';

class MyComponent {
  constructor(private tokenStorage: TokenStorageService) {}

  saveToken(token: string): void {
    this.tokenStorage.storeToken(token);
  }

  checkAuthentication(): boolean {
    return this.tokenStorage.isTokenValid();
  }

  getUserInfo(): void {
    const email = this.tokenStorage.getUserEmail();
    const userId = this.tokenStorage.getUserId();
    const username = this.tokenStorage.getUsername();
  }
}
```

### 3. OpenID Authentication Service

The `OpenIDAuthenticationService` handles communication with the backend authentication API:

**Features:**
- Initiate authentication flow with identity providers
- Register new users
- Redirect to provider authorization URLs

**Usage Example:**

```typescript
import { OpenIDAuthenticationService } from '@commons/session';

class LoginComponent {
  constructor(private authService: OpenIDAuthenticationService) {}

  loginWithGoogle(): void {
    this.authService.initiateAuthentication('google')
      .subscribe(response => {
        this.authService.redirectToProvider(response.authorization_url);
      });
  }

  loginWithCognito(): void {
    this.authService.initiateAuthentication('cognito')
      .subscribe(response => {
        this.authService.redirectToProvider(response.authorization_url);
      });
  }
}
```

### 4. Session Management Service

The `SessionManagementService` manages the user session lifecycle:

**Features:**
- Track authentication state
- Observable authentication status
- Login and logout operations
- Access user information

**Usage Example:**

```typescript
import { SessionManagementService } from '@commons/session';

class AppComponent {
  isAuthenticated$ = this.sessionService.isAuthenticated$;

  constructor(private sessionService: SessionManagementService) {}

  login(token: string): void {
    this.sessionService.login(token);
  }

  logout(): void {
    this.sessionService.logout();
  }

  checkAuth(): boolean {
    return this.sessionService.isAuthenticated();
  }
}
```

### 5. Authentication Interceptor

The `authInterceptor` automatically attaches JWT tokens to HTTP requests:

**Features:**
- Automatically adds Authorization header
- Validates token before attaching
- Clears invalid tokens

**Configuration:**

```typescript
// app.config.ts
import { authInterceptor } from '@commons/session';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

### 6. Authentication Orchestration Service

The `AuthenticationOrchestrationService` coordinates the complete authentication flow:

**Features:**
- Start authentication flow with providers
- Complete user registration
- Handle authentication errors
- Coordinate session management

**Usage Example:**

```typescript
import { AuthenticationOrchestrationService } from '@commons/session';

class LoginComponent {
  constructor(private orchestration: AuthenticationOrchestrationService) {}

  loginWithGoogle(): void {
    this.orchestration.startAuthenticationFlow('google');
  }

  completeRegistration(operationId: string, displayName: string, username: string): void {
    this.orchestration.completeRegistration({
      register_user_operation_id: operationId,
      profile_display_name: displayName,
      profile_username: username
    }).subscribe({
      next: (response) => {
        // User is now authenticated and redirected
      },
      error: (error) => {
        console.error('Registration failed', error);
      }
    });
  }
}
```

### 7. Authentication Guard

The `openIDAuthGuard` protects routes that require authentication:

**Usage Example:**

```typescript
// app.routes.ts
import { openIDAuthGuard } from '@commons/session';

export const routes: Routes = [
  {
    path: 'keyring',
    component: KeyringIndexPageComponent,
    canActivate: [openIDAuthGuard]
  },
  {
    path: 'login-check',
    component: LoginCheckPageComponent
  }
];
```

### 8. Callback Parameters Extractor

The `AuthCallbackParamsExtractor` utility extracts and validates callback parameters:

**Features:**
- Extract query parameters from callback URL
- Check for errors
- Determine callback result type
- Validate authentication status

**Usage Example:**

```typescript
import { AuthCallbackParamsExtractor } from '@commons/session';

class CallbackComponent {
  constructor(
    private route: ActivatedRoute,
    private paramsExtractor: AuthCallbackParamsExtractor
  ) {}

  ngOnInit(): void {
    const params = this.paramsExtractor.extractCallbackParams(this.route);

    if (this.paramsExtractor.hasError(params)) {
      this.handleError(params.error);
    } else if (this.paramsExtractor.isSuccess(params)) {
      this.handleSuccess(params.token);
    } else if (this.paramsExtractor.requiresRegistration(params)) {
      this.showRegistrationForm(params.register_user_operation_id);
    } else if (this.paramsExtractor.requiresMatchingDecision(params)) {
      this.showMatchingDialog(params);
    }
  }
}
```

## Authentication Flow

### 1. Initiate Authentication

```typescript
// User clicks "Login with Google"
orchestrationService.startAuthenticationFlow('google');

// Backend generates authorization URL
// User is redirected to Google
```

### 2. Provider Authentication

```
User authenticates with Google
Google redirects back to backend callback endpoint
Backend validates authentication and creates session
```

### 3. Callback Handling

```typescript
// Backend redirects to application callback URL with parameters
const params = paramsExtractor.extractCallbackParams(route);

if (params.internal_authentication_result === 'SUCCESS') {
  // User already exists, store token and redirect
  sessionService.login(params.token);
  router.navigate(['/keyring']);
}

if (params.internal_authentication_result === 'NON_EXISTING_USER') {
  // Show registration form
  showRegistrationForm(params.register_user_operation_id);
}

if (params.internal_authentication_result === 'PARTIAL_MATCHING_USER') {
  // Show matching confirmation
  showMatchingDialog(params.matching_user_display_name);
}
```

### 4. User Registration

```typescript
// User completes registration form
orchestrationService.completeRegistration({
  register_user_operation_id: operationId,
  profile_display_name: 'John Doe',
  profile_username: 'johndoe'
}).subscribe(response => {
  // Token is automatically stored and user is redirected
});
```

## Types and Interfaces

### OpenIDProvider

```typescript
type OpenIDProvider = 'google' | 'cognito';
```

### AuthInitiateResponse

```typescript
interface AuthInitiateResponse {
  authorization_url: string;
  state: string;
  provider: string;
  redirect_url: string;
}
```

### AuthCallbackParams

```typescript
interface AuthCallbackParams {
  external_authentication_result?: string;
  internal_authentication_result?: string;
  register_user_operation_id?: string;
  register_user_operation_type?: string;
  token?: string;
  error?: string;
  matching_user_display_name?: string;
}
```

### RegisterUserRequest

```typescript
interface RegisterUserRequest {
  register_user_operation_id: string;
  client_choice?: 'ACCEPT' | 'REJECT';
  profile_display_name?: string;
  profile_username?: string;
}
```

## Installation

The infrastructure uses the following dependencies:

```bash
npm install jwt-decode
```

## Configuration

Add the following to your environment files:

```typescript
export const environment = {
  xihucalliAuthAPIHostname: 'YOUR_API_HOSTNAME',
  authInitiateEndpoint: '/auth/initiate',
  authCallbackEndpoint: '/auth/callback',
  authRegisterEndpoint: '/register',
  callbackRedirectUrl: 'YOUR_APP_CALLBACK_URL'
};
```

Register the authentication interceptor in `app.config.ts`:

```typescript
import { authInterceptor } from '@commons/session';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

