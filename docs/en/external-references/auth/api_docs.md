Here is a table with the endpoints of the api:

| Endpoint                              | Método HTTP | Query Params | Headers       | Response headers                                   |
|---------------------------------------|-------------|--------------|---------------|----------------------------------------------------|
| /xihucalli/user/auth/initiate         | GET         | provider     | None          | 200 OK, 400 Bad Request, 500 Internal Server Error |
| /xihucalli/user/google/token-exchange | POST        | None         | None          | 200 OK, 400 Bad Request, 500 Internal Server Error |
| /xihucalli/user/token-exchange        | POST        | provider     | None          | 200 OK, 400 Bad Request, 401 Unauthorized          |
| /xihucalli/user/token                 | GET         | None         | Authorization | 200 OK, 401 Unauthorized                           |
| /xihucalli/user/register              | POST        | None         | Authorization | 200 OK, 400 Bad Request, 401 Unauthorized          |

Here is the documentation more detailed for each endpoint:

### Endpoint: /xihucalli/user/auth/initiate

This endpoint initiates an OAuth2/OIDC authentication flow for the specified provider. It creates a short-lived authentication state (state + nonce) and returns an authorization URL that the client must use to redirect the user to the identity provider (Google or Cognito).

Request
- Method: GET
- Query parameters:
  - provider (required): `google` or `cognito`

Response envelope (runtime format)
- The runtime response is an envelope produced by `CommonHttpResponseGenerator` with the following top-level fields:
  - `statusCode` (int)
  - `message` (object) — note: `message` is now a JSON object with the payload (not a serialized string)
  - `timestamp` (string)

Pretty-printed runtime example (exact format used at runtime):

```json
{
  "statusCode": 200,
  "message": {
    "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=openid%20email%20profile&state=abc123&nonce=xyz456",
    "state": "abc123",
    "provider": "google"
  },
  "timestamp": "2025-10-23T12:34:56.789"
}
```

Notes:
- `message` is directly an object; clients can access `message.authorization_url`, `message.state` and `message.provider` without extra parsing.

Error examples

- Missing or invalid provider (400):

```json
{
  "error": "BAD_REQUEST",
  "message": "Missing or invalid provider parameter. Supported values: google, cognito",
  "timestamp": "2025-10-23T12:35:01.123",
  "statusCode": 400
}
```

- Internal server error (500):

```json
{
  "error": "INTERNAL_ERROR",
  "message": "Failed to generate authorization URL: <detail>",
  "timestamp": "2025-10-23T12:35:05.456",
  "statusCode": 500
}
```

----

### Other endpoints

- `/xihucalli/user/google/token-exchange` (POST): exchanges Google authorization code for tokens. See existing implementation in `GoogleAuthorizationCodeExchangeController`.

- `/xihucalli/user/token-exchange` (POST): exchanges provider tokens for application JWT. See `TokenExchangeController`.

- `/xihucalli/user/token` (GET): returns user info based on Authorization header (Bearer token).

- `/xihucalli/user/register` (POST): registers user info using provided token payload.
