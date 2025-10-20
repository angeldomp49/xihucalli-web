# Authentication flow #

The authentication process is the following.

The user go to the root or home pages.
The application checks the user xihucalli token with the XihucalliAuthenticationGuard and service
If the user has a valid token, the user go to the home page.
If the user doesn't have a valid xihucalli access token, the application shows the login check page
The user can decide which identity provider to get a valid access token specific for itself.
Once the authentication process finishes successfully, the specific access token is used to be sent to xihucalli authentication api
to get a xihucalli access token that will be stored in the local storage.
When the user go to the home page or any other, it will read this stored access token.

## Authentication Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant App as Angular App
    participant XihucalliGuard as XihucalliAuthenticationGuard
    participant XihucalliService as XihucalliAuthenticationService
    participant LocalStorage as Local Storage
    participant LoginPage as Login Check Page
    participant OpenIDService as OpenIDAuthenticationService
    participant Cognito as Cognito Hosted UI
    participant AfterLoginPage as After Login Page
    participant XihucalliAPI as Xihucalli Auth API
    participant HomePage as Home Page

    User->>App: Navigate to root/home page
    App->>XihucalliGuard: canActivate()
    XihucalliGuard->>XihucalliService: performAuthCheck()
    XihucalliService->>LocalStorage: Get xihucalli access token
    
    alt Token exists in LocalStorage
        LocalStorage-->>XihucalliService: Return token
        XihucalliService->>XihucalliAPI: Check session validity
        alt Token is valid
            XihucalliAPI-->>XihucalliService: isAuthenticated: true
            XihucalliService-->>XihucalliGuard: true
            XihucalliGuard-->>App: Allow navigation
            App->>HomePage: Show home page
        else Token is invalid
            XihucalliAPI-->>XihucalliService: isAuthenticated: false
            XihucalliService-->>XihucalliGuard: false
            XihucalliGuard->>LoginPage: Redirect to login
        end
    else No token found
        LocalStorage-->>XihucalliService: null
        XihucalliService-->>XihucalliGuard: false
        XihucalliGuard->>LoginPage: Redirect to login
    end

    User->>LoginPage: View login options
    LoginPage->>OpenIDService: performAuthCheck()
    OpenIDService-->>LoginPage: Check if already authenticated with IdP
    
    alt Not authenticated with IdP
        User->>LoginPage: Click start login button
        LoginPage->>OpenIDService: login()
        OpenIDService->>Cognito: Redirect to Cognito Hosted UI
        User->>Cognito: Enter credentials
        Cognito-->>AfterLoginPage: Redirect with auth code/tokens
        AfterLoginPage->>OpenIDService: completeAuthenticationProcess()
        OpenIDService->>OpenIDService: Store IdP tokens (memory/sessionStorage)
        OpenIDService-->>AfterLoginPage: LoginResponse with IdP token
        AfterLoginPage->>XihucalliAPI: POST /token-exchange (IdP token)
        XihucalliAPI-->>AfterLoginPage: Return xihucalli access token
        AfterLoginPage->>LocalStorage: Store xihucalli access token
        AfterLoginPage->>HomePage: Redirect to home page
    else Already authenticated with IdP
        LoginPage->>XihucalliAPI: POST /token-exchange (cached IdP token)
        XihucalliAPI-->>LoginPage: Return xihucalli access token
        LoginPage->>LocalStorage: Store xihucalli access token
        LoginPage->>HomePage: Redirect to home page
    end
```
