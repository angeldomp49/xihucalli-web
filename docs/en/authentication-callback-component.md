# Authentication Callback Component

This document describes the Authentication Callback Component that processes the callback from the OpenID authentication provider after user authentication.

## Overview

The Authentication Callback Component handles the redirect from the backend authentication service after the user has authenticated with an OpenID provider (Google, Cognito, etc.). It processes the callback parameters and routes the user to the appropriate destination based on the authentication result.

## Features

- Processes authentication callback parameters
- Handles successful authentication with JWT token storage
- Handles user registration requirements
- Handles account linking decisions for partial matches
- Provides error handling and user feedback
- Automatic redirection based on authentication state

## Architecture

### Component Structure

The callback component uses the following services:

- **AuthCallbackParamsExtractor**: Extracts and validates callback parameters from the URL
- **TokenStorageService**: Stores JWT tokens in local storage
- **Router**: Navigates to appropriate routes based on authentication state

### Authentication States

The component handles four main states:

1. **Success**: User authenticated successfully, JWT token provided
2. **Registration Required**: External authentication succeeded but internal user doesn't exist
3. **Matching Decision Required**: External authentication succeeded but partial user match found
4. **Error**: Authentication failed or error occurred

## Usage

### Route Configuration

The callback route is configured in the application routing:

```typescript
export const routes: Routes = [
  {
    path: "auth/callback",
    component: AuthCallbackPageComponent
  }
];
```

### Callback URL Parameters

The backend redirects to this component with the following query parameters:

#### Success Case
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=SUCCESS&token=eyJhbGc...
```

#### Registration Required Case
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=NON_EXISTING_USER&register_user_operation_id=abc123&register_user_operation_type=FRESH_INTERNAL_USER
```

#### Matching Decision Required Case
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=PARTIAL_MATCHING_USER&register_user_operation_id=def456&register_user_operation_type=ATTACH_LOGIN_INFORMATION_TO_MASTER_USER&matching_user_display_name=John%20Doe
```

#### Error Case
```
/auth/callback?external_authentication_result=FAILURE&error=Invalid+credentials
```

### Component Flow

```typescript
ngOnInit() {
  // Extract callback parameters from URL
  const params = paramsExtractor.extractCallbackParams(route);
  
  // Check authentication state and route accordingly
  if (hasError) {
    handleError();
  } else if (isSuccess) {
    storeToken();
    navigateToHome();
  } else if (requiresRegistration) {
    navigateToRegistration();
  } else if (requiresMatchingDecision) {
    navigateToLinkAccount();
  }
}
```

## Integration Example

### Step 1: User Initiates Login

```typescript
// Login component
initiateGoogleLogin(): void {
  this.authService.initiateAuthentication('google')
    .subscribe(response => {
      window.location.href = response.authorization_url;
    });
}
```

### Step 2: Backend Processes Authentication

The backend exchanges the authorization code with the provider and redirects back:

```
https://your-domain.com/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=SUCCESS&token=eyJhbGc...
```

### Step 3: Callback Component Processes Result

```typescript
// AuthCallbackPageComponent automatically processes the callback
private handleAuthenticationSuccess(params: AuthCallbackParams): void {
  if (!params.token) {
    this.handleError({ error: 'No token received from server' });
    return;
  }

  this.tokenStorage.storeToken(params.token);
  this.router.navigate(['/keyring']);
}
```

### Step 4: User Lands on Protected Route

The user is automatically redirected to the home page with the JWT token stored.

## Error Handling

The component provides visual feedback for errors:

- Displays error message to the user
- Automatically redirects to login page after 3 seconds
- Logs errors to console for debugging

Example error display:

```html
<div class="error-state">
  <h2>Authentication Error</h2>
  <p>{{ errorMessage }}</p>
  <p>Redirecting to login page...</p>
</div>
```

## Security Considerations

1. **State Validation**: The backend validates the OAuth state parameter to prevent CSRF attacks
2. **Token Storage**: JWT tokens are stored in local storage for session management
3. **Error Messages**: Generic error messages are shown to users to avoid information disclosure
4. **Automatic Cleanup**: Failed authentication attempts redirect to login page

## Environment Configuration

The callback URL must be configured in the environment:

```typescript
export const environment = {
  callbackRedirectUrl: 'https://your-domain.com/auth/callback'
};
```

This URL must also be registered with the OpenID providers (Google, Cognito) as an authorized redirect URI.

## Related Components

- [OpenID Authentication Service](../openid-authentication-infrastructure.md)
- [Authentication Initiator](./external-references/master_user/authentication-initiator.md)
- [User Registration](./external-references/master_user/register-user.md)
- [User Relationship System](./external-references/master_user/user-relationship-system.md)

