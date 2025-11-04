# Authentication Callback

This document describes the authentication callback functionality that processes OAuth 2.0 authorization code responses
from Identity Providers (IDPs) and generates application JWT tokens.

## Overview

The Authentication Callback endpoint handles the redirect from Identity Providers after user authentication, validates
the authorization code, exchanges it for tokens, validates the ID token, and generates a JWT token for the application.

## Architecture

### Components

1. **AuthenticationCallbackController**: Main controller that orchestrates the callback flow
2. **TokenValidator**: Validates ID tokens received from IDPs
3. **UserInfoExtractor**: Extracts user information from ID tokens
4. **ValidationResult**: Represents the result of token validation
5. **IDPTokenExchangeService**: Service interface for exchanging authorization codes
6. **AuthStateManager**: Manages authentication state and CSRF protection

## Endpoint

```
GET /xihucalli/user/auth/callback
```

### Query Parameters

- `code`: Authorization code from the IDP
- `state`: CSRF protection state parameter
- `error` (optional): Error code if authentication failed
- `error_description` (optional): Human-readable error description

## Flow

1. **Receive Callback**: IDP redirects to callback endpoint with authorization code and state
2. **Validate State**: Verify state parameter to prevent CSRF attacks
3. **Exchange Code**: Exchange authorization code for tokens (access token, ID token, refresh token)
4. **Validate Token**: Validate the ID token signature and claims
5. **Extract User Info**: Extract user information from the validated ID token
6. **Generate JWT**: Create application-specific JWT token
7. **Redirect to SPA**: Redirect user to SPA with the JWT token

## Usage Example

### Step 1: User clicks "Login with Google" in SPA

```javascript
// SPA initiates authentication
const response = await fetch('/xihucalli/user/auth/initiate?provider=GOOGLE');
const data = await response.json();
window.location.href = data.authorizationUrl;
```

### Step 2: User authenticates with Google

Google redirects to:

```
GET /xihucalli/user/auth/callback?code=4/0AY0e-g7...&state=abc123xyz
```

### Step 3: Backend processes callback

The AuthenticationCallbackController:

- Validates the state parameter
- Exchanges the authorization code for tokens
- Validates the ID token
- Generates application JWT
- Redirects to SPA

### Step 4: SPA receives token

```
https://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```javascript
// SPA extracts and stores token
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
    localStorage.setItem('access_token', token);
    window.location.href = '/dashboard';
}
```

## Error Handling

If an error occurs, the user is redirected to the SPA with an error parameter:

```
https://localhost:3000/auth/callback?error=Invalid+or+expired+state
```

### Error Scenarios

- Missing authorization code
- Missing state parameter
- Invalid or expired state
- Failed token exchange
- Token validation failure
- Expired authentication session

## Security

### State Validation

The state parameter is validated to prevent CSRF attacks:

- Generated securely by the backend
- Stored temporarily (TTL: 10 minutes)
- Validated on callback
- Removed after successful authentication

### Token Validation

ID tokens are validated to ensure authenticity:

- Signature verification using IDP's public keys
- Claims validation (issuer, audience, expiration)
- Nonce validation (prevents replay attacks)

### JWT Generation

Application JWTs are generated with:

- HS256 signature algorithm
- User information (sub, email, username)
- Session validation flag

## Configuration

### application.properties

```properties
# SPA redirect URL
spa.redirect.url=https://localhost:3000/auth/callback

# Authentication state TTL
auth.state.ttl.seconds=600

# IDP configurations
google.client.id=your-client-id
google.client.secret=your-client-secret
google.redirect.uri=https://api.domain.com/xihucalli/user/auth/callback

cognito.domain=https://cognito-idp.region.amazonaws.com
cognito.client.id=your-client-id
cognito.client.secret=your-client-secret
cognito.redirect.uri=https://api.domain.com/xihucalli/user/auth/callback
```

### Environment Variables

```bash
JWT_SECRET_KEY=your-secret-key-for-jwt-signing
```

## Supported Identity Providers

- **Google**: OAuth 2.0 with OpenID Connect
- **AWS Cognito**: OAuth 2.0 with OpenID Connect

## Integration

The callback controller is registered in the application routing:

```java
routesRegistry.put(
    s -> s.equals(get(urlPrefix+"/auth/callback")), 
    authenticationCallbackController
);
```

## Related Components

- [Authentication Initiator](authentication-initiator.md)
- [Token Exchange Services](token-exchange.md)
- [Auth State Management](auth-state-management.md)

