# Authentication Initiator

This document describes the authentication initiator functionality that generates OAuth 2.0 authorization URLs for
Identity Providers (IDPs) and manages authentication state.

## Overview

The Authentication Initiator endpoint is the first step in the OAuth 2.0 Authorization Code Flow. It generates secure
authorization URLs with state and nonce parameters, stores the authentication session, and returns the URL to the client
for redirection.

## Endpoint

```
GET /xihucalli/user/auth/initiate
```

### Query Parameters

- `provider` (required): Identity provider name. Supported values: `google`, `cognito`
- `redirect_url` (required): Client application URL where the user should be redirected after successful authentication

### Example Request

```
GET /xihucalli/user/auth/initiate?provider=google&redirect_url=https://myapp.com/auth/callback
```

## Response

### Success Response (200)

```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&state=abc123&nonce=xyz789",
  "state": "abc123xyz...",
  "provider": "google",
  "redirect_url": "https://myapp.com/auth/callback"
}
```

### Error Responses

#### Missing Provider (400)

```json
{
  "error": "BAD_REQUEST",
  "message": "Missing or invalid provider parameter. Supported values: google, cognito",
  "statusCode": 400
}
```

#### Missing Redirect URL (400)

```json
{
  "error": "BAD_REQUEST",
  "message": "Missing or invalid redirect_url parameter",
  "statusCode": 400
}
```

#### Unsupported Provider (400)

```json
{
  "error": "BAD_REQUEST",
  "message": "Unsupported provider: facebook. Supported values: google, cognito",
  "statusCode": 400
}
```

#### Internal Error (500)

```json
{
  "error": "INTERNAL_ERROR",
  "message": "INTERNAL SERVER ERROR",
  "statusCode": 500
}
```

## Usage Example

### Step 1: Client Requests Authorization URL

```javascript
const provider = 'google';
const redirectUrl = 'https://myapp.com/auth/callback';

const response = await fetch(
  `/xihucalli/user/auth/initiate?provider=${provider}&redirect_url=${encodeURIComponent(redirectUrl)}`
);

const data = await response.json();

if (response.ok) {
  window.location.href = data.authorization_url;
} else {
  console.error('Authentication initiation failed:', data.message);
}
```

### Step 2: User is Redirected to IDP

The browser redirects to the `authorization_url` returned in the response:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://api.domain.com/xihucalli/user/auth/callback&
  response_type=code&
  scope=openid+email+profile&
  state=abc123xyz...&
  nonce=def456uvw...
```

### Step 3: User Authenticates with IDP

The user logs in with their Google/Cognito credentials.

### Step 4: IDP Redirects to Callback

After successful authentication, the IDP redirects to the backend callback endpoint:

```
GET /xihucalli/user/auth/callback?code=AUTH_CODE&state=abc123xyz...
```

## Security Features

### State Parameter

- **Purpose**: CSRF protection
- **Generation**: Cryptographically secure random string (32 bytes, base64url encoded)
- **Storage**: Temporarily stored with TTL (default: 10 minutes)
- **Validation**: Must match during callback processing
- **Single Use**: Removed after successful authentication

### Nonce Parameter

- **Purpose**: Replay attack prevention
- **Generation**: Cryptographically secure random string (32 bytes, base64url encoded)
- **Usage**: Included in ID token claims and validated during token verification
- **Association**: Linked to state in authentication session

### Redirect URL Validation

The `redirect_url` parameter is stored in the authentication session and used later to redirect the user back to the
client application after successful authentication. This allows the backend to maintain the complete authentication flow
while supporting multiple client applications.

## Architecture

### Components

1. **AuthenticationInitiatorController**: Main controller handling the initiation request
2. **AuthStateManager**: Manages authentication state lifecycle
3. **AuthorizationUrlBuilder**: Builds provider-specific authorization URLs
4. **AuthStateRepository**: Stores temporary authentication sessions

### Flow Diagram

```
Client → Backend: GET /auth/initiate?provider=google&redirect_url=...
Backend → AuthStateManager: Create state & nonce
AuthStateManager → Repository: Store session (TTL: 10 min)
Backend → UrlBuilder: Build authorization URL
Backend → Client: Return authorization URL + state
Client → IDP: Redirect to authorization URL
```

## Configuration

### application.properties

```properties
# Google OAuth Configuration
google.client.id=your-client-id
google.redirect.uri=https://api.domain.com/xihucalli/user/auth/callback

# Cognito OAuth Configuration
cognito.domain=https://cognito-idp.region.amazonaws.com
cognito.client.id=your-client-id
cognito.redirect.uri=https://api.domain.com/xihucalli/user/auth/callback

# Authentication State TTL
auth.state.ttl.seconds=600
```

## Supported Identity Providers

### Google

- **Authorization Endpoint**: `https://accounts.google.com/o/oauth2/v2/auth`
- **Scopes**: `openid email profile`
- **Response Type**: `code`
- **Access Type**: `offline` (for refresh tokens)

### AWS Cognito

- **Authorization Endpoint**: `https://{domain}.auth.{region}.amazoncognito.com/oauth2/authorize`
- **Scopes**: `openid email profile`
- **Response Type**: `code`

## Error Handling

All errors are returned with appropriate HTTP status codes and JSON error responses:

- **400 Bad Request**: Invalid or missing parameters
- **500 Internal Server Error**: Unexpected server errors

Errors are logged for debugging purposes while maintaining security by not exposing sensitive information to clients.

## Integration

### Route Registration

The endpoint is registered in `RouterForAllControllers`:

```java
routesRegistry.put(
    s -> s.equals(get(urlPrefix+"/auth/initiate")), 
    authenticationInitiatorController
);
```

### Bean Configuration

Configured in `ApplicationStartUp.java`:

```java
new SingletonInformation(
    "authenticationInitiatorController",
    (ctx, container) -> new AuthenticationInitiatorController(
        container.getSingleton("commonHttpResponseGenerator", CommonHttpResponseGenerator.class),
        container.getSingleton("authStateManager", AuthStateManager.class),
        container.getSingleton("authorizationUrlBuilder", AuthorizationUrlBuilder.class)
    ),
    "commonHttpResponseGenerator",
    "authStateManager",
    "authorizationUrlBuilder"
)
```

## Related Components

- [Authentication Callback](authentication-callback.md)
- [Auth State Management](auth-state-management.md)
- [Authorization URL Builder](authorization-url-builder.md)

