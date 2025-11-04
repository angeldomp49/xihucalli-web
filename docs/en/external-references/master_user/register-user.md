# Register User

This document describes the user registration functionality that completes the user account creation or linking process
after external OAuth 2.0 authentication.

## Overview

The Register User endpoint handles the final step of user onboarding after external authentication. It processes
registration operations created by the Authentication Callback controller, creates new user accounts or links login
information to existing accounts, and generates JWT tokens for authenticated users.

## Architecture

### Components

1. **RegisterUserController**: Main controller that orchestrates the registration flow
2. **RegisterUserOperationSystem**: Manages registration operations and user creation
3. **XihucalliTokenGenerator**: Generates application-specific JWT tokens
4. **UserRelationshipSystem**: Handles user matching and relationship queries
5. **CommonHttpResponseGenerator**: Standardizes HTTP responses

## Endpoint

```
POST /xihucalli/user/register
```

### Query Parameters

- `register_user_operation_id` (required): UUID of the registration operation created during authentication callback
- `client_choice` (optional): User's decision for partial matches. Values: `ACCEPT`, `REJECT`
- `profile_display_name` (conditional): Display name for the new user profile
- `profile_username` (conditional): Username for the new user profile

**Note**: `profile_display_name` and `profile_username` are required when creating a fresh user (REJECT choice or
FRESH_INTERNAL_USER operation type).

## Flow

### Scenario 1: New User Registration (FRESH_INTERNAL_USER)

1. **Receive Request**: Client sends registration request with operation ID and profile information
2. **Retrieve Operation**: Fetch registration operation data from database
3. **Validate Operation Type**: Verify operation type is FRESH_INTERNAL_USER
4. **Generate Profile Info**: Auto-generate username and display name if not provided
5. **Create Master User**: Insert new user record with profile information
6. **Create Login Information**: Insert login information record linked to master user
7. **Update Operation Status**: Mark operation as IN_PROGRESS → COMPLETED
8. **Generate JWT**: Create application-specific JWT token
9. **Return Token**: Send JWT token to client

### Scenario 2: Link to Existing User (ATTACH_LOGIN_INFORMATION_TO_MASTER_USER with ACCEPT)

1. **Receive Request**: Client sends registration request with operation ID and ACCEPT choice
2. **Retrieve Operation**: Fetch registration operation data from database
3. **Validate Operation Type**: Verify operation type is ATTACH_LOGIN_INFORMATION_TO_MASTER_USER
4. **Retrieve Master User**: Fetch existing master user information
5. **Create Login Information**: Insert login information record linked to existing master user
6. **Update Operation Status**: Mark operation as IN_PROGRESS → COMPLETED
7. **Generate JWT**: Create application-specific JWT token
8. **Return Token**: Send JWT token to client

### Scenario 3: Reject Match and Create New User (ATTACH_LOGIN_INFORMATION_TO_MASTER_USER with REJECT)

1. **Receive Request**: Client sends registration request with operation ID, REJECT choice, and profile information
2. **Retrieve Operation**: Fetch registration operation data from database
3. **Override Decision**: Treat as FRESH_INTERNAL_USER despite partial match
4. **Generate Profile Info**: Auto-generate username and display name if not provided
5. **Create Master User**: Insert new user record with profile information
6. **Create Login Information**: Insert login information record linked to new master user
7. **Update Operation Status**: Mark operation as IN_PROGRESS → COMPLETED
8. **Generate JWT**: Create application-specific JWT token
9. **Return Token**: Send JWT token to client

## Usage Example

### Scenario 1: New User Registration

```javascript
// Step 1: User completes registration form in SPA
const registrationData = {
    register_user_operation_id: 'uuid-from-callback',
    profile_display_name: 'John Doe',
    profile_username: 'johndoe'
};

// Step 2: Submit registration request
const response = await fetch(
    `/xihucalli/user/register?` + new URLSearchParams(registrationData),
    { method: 'POST' }
);

const result = await response.json();

// Step 3: Store JWT token and redirect
if (response.status === 201) {
    localStorage.setItem('access_token', result.token);
    window.location.href = '/dashboard';
} else {
    console.error('Registration failed:', result.error);
}
```

### Scenario 2: Accept Partial Match

```javascript
// User confirms they want to link to existing account
const response = await fetch(
    `/xihucalli/user/register?` + new URLSearchParams({
        register_user_operation_id: 'uuid-from-callback',
        client_choice: 'ACCEPT'
    }),
    { method: 'POST' }
);

const result = await response.json();

if (response.status === 201) {
    localStorage.setItem('access_token', result.token);
    window.location.href = '/dashboard';
}
```

### Scenario 3: Reject Partial Match

```javascript
// User decides to create a new account despite partial match
const response = await fetch(
    `/xihucalli/user/register?` + new URLSearchParams({
        register_user_operation_id: 'uuid-from-callback',
        client_choice: 'REJECT',
        profile_display_name: 'John Smith',
        profile_username: 'johnsmith'
    }),
    { method: 'POST' }
);

const result = await response.json();

if (response.status === 201) {
    localStorage.setItem('access_token', result.token);
    window.location.href = '/dashboard';
}
```

### Complete Flow Example

```javascript
// Complete registration flow from callback to dashboard
class RegistrationHandler {
    
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const externalResult = urlParams.get('external_authentication_result');
        const internalResult = urlParams.get('internal_authentication_result');
        const operationId = urlParams.get('register_user_operation_id');
        
        if (externalResult !== 'SUCCESS') {
            this.handleAuthError(urlParams.get('error'));
            return;
        }
        
        if (internalResult === 'SUCCESS') {
            // Already authenticated, store token
            const token = urlParams.get('token');
            localStorage.setItem('access_token', token);
            window.location.href = '/dashboard';
            return;
        }
        
        if (internalResult === 'NON_EXISTING_USER') {
            // Show registration form
            this.showRegistrationForm(operationId);
            return;
        }
        
        if (internalResult === 'PARTIAL_MATCHING_USER') {
            // Show confirmation dialog
            const matchingName = urlParams.get('matching_user_display_name');
            this.showConfirmationDialog(operationId, matchingName);
            return;
        }
    }
    
    showRegistrationForm(operationId) {
        document.getElementById('registration-form').style.display = 'block';
        document.getElementById('registration-form').onsubmit = async (e) => {
            e.preventDefault();
            
            const displayName = document.getElementById('display-name').value;
            const username = document.getElementById('username').value;
            
            await this.completeRegistration(operationId, null, displayName, username);
        };
    }
    
    async showConfirmationDialog(operationId, matchingName) {
        const userAccepts = confirm(
            `We found an account with name "${matchingName}". Is this you?`
        );
        
        if (userAccepts) {
            await this.completeRegistration(operationId, 'ACCEPT');
        } else {
            this.showRegistrationForm(operationId);
            // When form is submitted, use REJECT choice
            document.getElementById('registration-form').onsubmit = async (e) => {
                e.preventDefault();
                const displayName = document.getElementById('display-name').value;
                const username = document.getElementById('username').value;
                await this.completeRegistration(operationId, 'REJECT', displayName, username);
            };
        }
    }
    
    async completeRegistration(operationId, choice, displayName, username) {
        const params = { register_user_operation_id: operationId };
        
        if (choice) params.client_choice = choice;
        if (displayName) params.profile_display_name = displayName;
        if (username) params.profile_username = username;
        
        const response = await fetch(
            `/xihucalli/user/register?` + new URLSearchParams(params),
            { method: 'POST' }
        );
        
        const result = await response.json();
        
        if (response.status === 201) {
            localStorage.setItem('access_token', result.token);
            window.location.href = '/dashboard';
        } else {
            alert('Registration failed: ' + result.message);
        }
    }
    
    handleAuthError(error) {
        alert('Authentication failed: ' + error);
        window.location.href = '/login';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationHandler().handleCallback();
});
```

## Auto-Generation Logic

### Username Generation

If `profile_username` is not provided, the system auto-generates a username from the email:

```
Email: john.doe@example.com
Generated Username: john_doe

Email: test+user@gmail.com
Generated Username: test_user

Email: null or empty
Generated Username: user_a1b2c3d4 (random 8-char suffix)
```

**Rules**:
- Extract part before @ symbol
- Replace non-alphanumeric characters (except underscore) with underscore
- Convert to lowercase
- If email is invalid/empty, generate random username with "user_" prefix

### Display Name Generation

If `profile_display_name` is not provided, the system auto-generates from first and last name:

```
First: "John", Last: "Doe"
Generated Display Name: "John Doe"

First: "John", Last: ""
Generated Display Name: "John"

First: "", Last: "Doe"
Generated Display Name: "Doe"

First: "", Last: ""
Generated Display Name: "User a1b2c3d4" (random 8-char suffix)
```

## Response Format

### Success Response (201 Created)

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.signature"
}
```

### Error Responses

#### Missing Required Parameters (400 Bad Request)

```json
{
    "error": "BAD_REQUEST",
    "message": "Missing required parameters"
}
```

#### Malformed Operation Type (500 Internal Server Error)

```json
{
    "error": "INTERNAL_SERVER_ERROR",
    "message": "Malformed operation type"
}
```

#### Error Creating User (500 Internal Server Error)

```json
{
    "error": "INTERNAL_SERVER_ERROR",
    "message": "Error when creating a new user"
}
```

## Error Handling

### Error Scenarios

1. **Missing Operation ID**: Returns 400 Bad Request
2. **Operation Not Found**: Returns 500 Internal Server Error with "Malformed operation type"
3. **Invalid Operation Type**: Returns 500 Internal Server Error with "Malformed operation type"
4. **Master User Creation Failed**: Returns 500 Internal Server Error with "Error when creating a new user"
5. **Login Information Creation Failed**: Returns 500 Internal Server Error with "Error when creating a new user"
6. **Master User Not Found (linking)**: Returns 500 Internal Server Error with "Error when creating a new user"

## Security

### Operation ID Protection

- Operation IDs are UUIDs to prevent enumeration attacks
- Each operation can only be processed once (status tracking prevents re-processing)
- Operations have a lifecycle: NEW → IN_PROGRESS → COMPLETED/FAILED

### JWT Token Security

- Tokens are signed with HS256 algorithm using a secret key
- Tokens contain user identification and profile information
- Token validation is required for all authenticated endpoints

### Profile Information Sanitization

- Usernames are sanitized to remove special characters
- Display names are validated before storage
- Email addresses are validated during operation creation

## Database Operations

### Read Operations

- Query register user operation by operation ID
- Query operation type for decision logic
- Query operation data (email, identity provider, names, etc.)
- Query master user by master user ID (for linking scenarios)

### Write Operations

- Update operation status transitions (NEW → IN_PROGRESS → COMPLETED/FAILED)
- Create master user record (for fresh user scenarios)
- Create login information record (for all scenarios)

### Operation Status Lifecycle

```
NEW (created by callback)
  ↓
IN_PROGRESS (when registration processing starts)
  ↓
COMPLETED (when user creation/linking succeeds)
  OR
FAILED (when user creation/linking fails)
```

## Operation Types

### FRESH_INTERNAL_USER

**Created When**: No matching user found in deep text-based search during callback

**Client Action**: Provide profile display name and username (or allow auto-generation)

**System Action**:
- Generates username from email if not provided
- Generates display name from first/last name if not provided
- Creates new master user record
- Creates new login information record
- Returns JWT token for new user

### ATTACH_LOGIN_INFORMATION_TO_MASTER_USER

**Created When**: Partial match found in deep text-based search during callback

**Client Action**: Choose to ACCEPT (link to existing) or REJECT (create new)

**System Action**:
- If ACCEPT:
  - Retrieves existing master user
  - Creates new login information record linked to existing user
  - Returns JWT token for existing user
- If REJECT:
  - Treats as FRESH_INTERNAL_USER
  - Creates new master user and login information
  - Returns JWT token for new user

## Decision Matrix

| Operation Type | Client Choice | Action Taken |
|---------------|---------------|--------------|
| FRESH_INTERNAL_USER | N/A | Create new master user + login info |
| FRESH_INTERNAL_USER | REJECT | Create new master user + login info |
| ATTACH_LOGIN_INFORMATION_TO_MASTER_USER | (empty) | Create new master user + login info |
| ATTACH_LOGIN_INFORMATION_TO_MASTER_USER | REJECT | Create new master user + login info |
| ATTACH_LOGIN_INFORMATION_TO_MASTER_USER | ACCEPT | Link login info to existing master user |

## Configuration

### application.properties

```properties
# Database configuration
master.user.table.name=xihucalli_schema.xihucalli_master_users
login.info.table.name=xihucalli_schema.xihucalli_login_informations
register.user.operation.table.name=xihucalli_schema.xihucalli_register_user_operations

# Aurora DSQL Configuration
aurora.dsql.region=us-east-2
aurora.dsql.cluster.arn=arn:aws:dsql:us-east-2:account-id:cluster/cluster-id
aurora.dsql.database.name=postgres
```

### Environment Variables

```bash
JWT_SECRET_KEY=your-secret-key-for-jwt-signing
```

## Integration

The register user controller is registered in the application routing:

```java
routesRegistry.put(
    s -> s.equals(post(urlPrefix+"/register")), 
    registerUserController
);
```

## JWT Token Structure

The generated JWT token contains the following claims:

```json
{
    "masterUserId": "uuid-of-master-user",
    "loginInformationId": "uuid-of-login-info",
    "profileDisplayName": "John Doe",
    "profileUsername": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
}
```

## Related Components

- [Authentication Callback](authentication-callback.md)
- [Authentication Initiator](authentication-initiator.md)
- [User Relationship System](user-relationship-system.md)

