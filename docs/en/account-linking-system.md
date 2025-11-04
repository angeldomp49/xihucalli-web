# Account Linking System

## Overview

The Account Linking System allows users to link their external authentication provider (Google, AWS Cognito, etc.) to an existing internal user account when a partial match is detected during the authentication process.

## Architecture

### Components

1. **LinkAccountPageComponent**: Main UI component for account linking decisions
2. **RegisterUserService**: Service for API communication with registration endpoints
3. **SessionManagementService**: Manages user session after successful linking
4. **AuthCallbackPageComponent**: Routes users to linking page when partial match detected

## User Flow

### Scenario: Partial Match Detected

When a user authenticates with an external provider and the backend detects a partial match (e.g., matching email or name), the following flow occurs:

```
External Auth Success
        ↓
Backend Callback
        ↓
Partial Match Detected
        ↓
AuthCallbackPageComponent
        ↓
Navigate to /link-account
        ↓
LinkAccountPageComponent
```

### User Decision Points

#### Option 1: Accept Link (Link to Existing Account)

**Flow:**
1. User views matching account information
2. User clicks "Yes, link to this account"
3. System calls backend with `client_choice=ACCEPT`
4. Backend links external login to existing master user
5. System receives JWT token
6. User is logged in and redirected to home page

**API Call:**
```typescript
registerService.acceptLinkAccount(operationId)
  .subscribe({
    next: (response) => {
      sessionManagement.login(response.token);
      router.navigate(['/keyring']);
    }
  });
```

#### Option 2: Reject Link (Create New Account)

**Flow:**
1. User views matching account information
2. User clicks "No, create a new account"
3. Registration form appears
4. User fills display name and username
5. System calls backend with `client_choice=REJECT` and profile data
6. Backend creates new master user and links external login
7. System receives JWT token
8. User is logged in and redirected to home page

**API Call:**
```typescript
registerService.rejectLinkAccount(operationId, displayName, username)
  .subscribe({
    next: (response) => {
      sessionManagement.login(response.token);
      router.navigate(['/keyring']);
    }
  });
```

## Component Details

### LinkAccountPageComponent

**Location:** `src/app/pages/link-account-page/`

**Responsibilities:**
- Display matching account information from backend
- Present clear accept/reject options to user
- Show registration form on rejection
- Validate user input for new account creation
- Handle API calls and responses
- Manage loading and error states

**Key Properties:**
- `matchingDisplayName`: Display name of the potentially matching account
- `operationId`: UUID of the registration operation
- `showRegistrationForm`: Boolean to toggle between decision and registration views
- `loading`: Loading state during API calls
- `errorMessage`: Error message display

**Key Methods:**
- `onAcceptLink()`: Handle user accepting the link
- `onRejectLink()`: Handle user rejecting the link
- `onSubmitNewAccount()`: Handle new account form submission
- `loadParameters()`: Extract query parameters from URL

### URL Parameters

The component expects the following query parameters:

- `operation_id` (required): UUID from the authentication callback
- `operation_type` (optional): Type of operation (for context)
- `matching_display_name` (required): Display name of matching account

**Example URL:**
```
/link-account?operation_id=550e8400-e29b-41d4-a716-446655440000&matching_display_name=John%20Doe
```

## UI/UX Features

### Visual Design

- Clean, modern card-based layout
- Purple gradient background for consistency
- User avatar icon for matching account display
- Clear, readable typography
- Responsive design for mobile and desktop

### User Experience

1. **Clear Information Display:**
   - Shows matching account name prominently
   - Uses visual card to highlight the match
   - Clear question: "Is this your account?"

2. **Obvious Action Buttons:**
   - Primary button (purple gradient): "Yes, link to this account"
   - Secondary button (gray): "No, create a new account"
   - Buttons are large and touch-friendly

3. **Progressive Disclosure:**
   - Registration form only appears after rejection
   - Reduces cognitive load
   - Clear back-and-forth flow

4. **Feedback and Validation:**
   - Real-time form validation
   - Clear error messages
   - Loading spinner during API calls
   - Success automatic redirect

## Form Validation

When creating a new account after rejection, the following validation rules apply:

### Display Name
- **Required:** Yes
- **Minimum Length:** 2 characters
- **Error Message:** "Display name is required" / "Display name must be at least 2 characters"

### Username
- **Required:** Yes
- **Minimum Length:** 3 characters
- **Pattern:** Only alphanumeric characters, hyphens, and underscores
- **Regex:** `/^[a-zA-Z0-9_-]+$/`
- **Error Messages:**
  - "Username is required"
  - "Username must be at least 3 characters"
  - "Username can only contain letters, numbers, hyphens, and underscores"

## Error Handling

### Client-Side Errors

1. **Missing Operation ID:**
   - Message: "Invalid request. Missing operation ID."
   - Action: Display error, prevent actions

2. **Form Validation Errors:**
   - Message: Field-specific error messages
   - Action: Highlight invalid fields, show error text

### Server-Side Errors

1. **Registration Failed:**
   - Message: Backend error message or "Operation failed. Please try again."
   - Action: Display error, allow retry

2. **Network Errors:**
   - Message: "Operation failed. Please try again."
   - Action: Display error, allow retry

## Security Considerations

### Operation ID Protection

- Operation IDs are UUIDs to prevent enumeration
- Each operation can only be processed once
- Operations have a limited lifetime
- Backend validates operation ownership

### User Confirmation

- Clear display of matching account prevents accidental linking
- Explicit user action required (no automatic linking)
- User can always choose to create separate account

### Data Validation

- All user input is validated client-side and server-side
- Username sanitization prevents injection attacks
- Display name length limits prevent abuse

## Backend Integration

### API Endpoint

**URL:** `POST /xihucalli/user/register`

**Accept Link Request:**
```
POST /xihucalli/user/register?register_user_operation_id=uuid-123&client_choice=ACCEPT
```

**Reject Link Request:**
```
POST /xihucalli/user/register?register_user_operation_id=uuid-123&client_choice=REJECT&profile_display_name=Jane%20Doe&profile_username=janedoe
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Backend Operation Types

The system handles the following operation type:

**ATTACH_LOGIN_INFORMATION_TO_MASTER_USER:**
- Created when: Partial match found during authentication
- Action on ACCEPT: Link external login to existing master user
- Action on REJECT: Create new master user and link external login

## Usage Examples

### Example 1: User Accepts Link

```typescript
// User arrives from callback with partial match
// URL: /link-account?operation_id=abc-123&matching_display_name=John%20Smith

// Component loads and displays:
// "We found an existing account that might be yours:"
// "John Smith"
// "Is this your account?"

// User clicks "Yes, link to this account"
onAcceptLink() {
  this.loading = true;
  this.errorMessage = null;

  this.registerService.acceptLinkAccount(this.operationId)
    .subscribe({
      next: (response) => {
        // Success! User is now logged in with existing account
        this.sessionManagement.login(response.token);
        this.router.navigate(['/keyring']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to link account. Please try again.';
      }
    });
}
```

### Example 2: User Rejects Link and Creates New Account

```typescript
// User clicks "No, create a new account"
onRejectLink() {
  this.showRegistrationForm = true;
  // Form appears with display name and username inputs
}

// User fills form:
// Display Name: "Jane Doe"
// Username: "janedoe"

// User submits form
onSubmitNewAccount() {
  if (this.registerForm.invalid) {
    this.markAllFieldsAsTouched();
    return;
  }

  this.loading = true;
  const { displayName, username } = this.registerForm.value;

  this.registerService.rejectLinkAccount(
    this.operationId,
    displayName,
    username
  ).subscribe({
    next: (response) => {
      // Success! New account created
      this.sessionManagement.login(response.token);
      this.router.navigate(['/keyring']);
    },
    error: (error) => {
      this.loading = false;
      this.errorMessage = 'Failed to create account. Please try again.';
    }
  });
}
```

### Example 3: Complete Flow from Callback

```typescript
// In AuthCallbackPageComponent
private handleMatchingDecision(params: AuthCallbackParams): void {
  if (!params.register_user_operation_id) {
    this.handleError({ error: 'Missing registration operation ID' });
    return;
  }

  this.router.navigate(['/link-account'], {
    queryParams: {
      operation_id: params.register_user_operation_id,
      operation_type: params.register_user_operation_type,
      matching_display_name: params.matching_user_display_name
    }
  });
}
```

## Testing Recommendations

### Unit Tests

1. **Component Initialization:**
   - Verify form is initialized with correct validators
   - Verify parameters are loaded from URL
   - Verify error handling for missing operation ID

2. **User Actions:**
   - Test `onAcceptLink()` calls service correctly
   - Test `onRejectLink()` shows registration form
   - Test `onSubmitNewAccount()` validates form before submission

3. **Form Validation:**
   - Test display name required validation
   - Test username pattern validation
   - Test error message generation

4. **Error Handling:**
   - Test API error handling
   - Test error message display
   - Test loading state management

### Integration Tests

1. **Accept Link Flow:**
   - Navigate to link-account page
   - Verify matching name is displayed
   - Click accept button
   - Verify API call is made
   - Verify redirect to home page

2. **Reject Link Flow:**
   - Navigate to link-account page
   - Click reject button
   - Verify registration form appears
   - Fill and submit form
   - Verify API call is made
   - Verify redirect to home page

3. **Error Scenarios:**
   - Test missing operation ID handling
   - Test API error handling
   - Test form validation errors

### E2E Tests

1. Complete authentication flow with partial match
2. Accept link and verify account access
3. Reject link, create new account, verify separate access

## Accessibility

- All buttons have clear labels
- Form inputs have associated labels
- Error messages are announced to screen readers
- Keyboard navigation is fully supported
- Color contrast meets WCAG AA standards

## Conclusion

The Account Linking System provides a secure and user-friendly way to handle partial account matches during authentication. It gives users full control over account linking decisions while maintaining security and data integrity.

