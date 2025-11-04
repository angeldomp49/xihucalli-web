# Infrastructure d'Authentification OpenID - Configuration et Services

Cette documentation décrit l'infrastructure d'authentification OpenID implémentée dans l'application Xihucalli, incluant la configuration, la gestion des jetons et les services d'authentification.

## Vue d'Ensemble

L'application utilise un flux d'authentification OpenID personnalisé qui s'intègre avec des fournisseurs d'identité externes (Google et Cognito) via un service d'authentification backend. L'implémentation suit les principes de Clean Architecture et fournit une gestion complète du cycle de vie d'authentification.

## Composants

### 1. Configuration d'Environnement

La configuration d'environnement de l'application inclut des endpoints et des paramètres spécifiques à OpenID:

```typescript
// environment.development.ts ou environment.ts
{
  xihucalliAuthAPIHostname: 'https://api.example.com/xihucalli/user',
  authInitiateEndpoint: '/auth/initiate',
  authCallbackEndpoint: '/auth/callback',
  authRegisterEndpoint: '/register',
  callbackRedirectUrl: 'https://app.example.com/auth/callback'
}
```

### 2. Service de Stockage de Jetons

Le `TokenStorageService` fournit un stockage et une gestion sécurisés des jetons JWT:

**Fonctionnalités:**
- Stocker et récupérer les jetons d'accès
- Stocker et récupérer les jetons de rafraîchissement
- Valider l'expiration des jetons
- Extraire les informations de la charge utile du jeton
- Effacer les jetons lors de la déconnexion

**Exemple d'Utilisation:**

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

### 3. Service d'Authentification OpenID

Le `OpenIDAuthenticationService` gère la communication avec l'API d'authentification backend:

**Fonctionnalités:**
- Initier le flux d'authentification avec les fournisseurs d'identité
- Enregistrer de nouveaux utilisateurs
- Rediriger vers les URLs d'autorisation du fournisseur

**Exemple d'Utilisation:**

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

### 4. Service de Gestion de Session

Le `SessionManagementService` gère le cycle de vie de la session utilisateur:

**Fonctionnalités:**
- Suivi de l'état d'authentification
- Statut d'authentification observable
- Opérations de connexion et déconnexion
- Accès aux informations utilisateur

**Exemple d'Utilisation:**

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

### 5. Intercepteur d'Authentification

L'`authInterceptor` attache automatiquement les jetons JWT aux requêtes HTTP:

**Fonctionnalités:**
- Ajoute automatiquement l'en-tête Authorization
- Valide le jeton avant de l'attacher
- Efface les jetons invalides

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

### 6. Service d'Orchestration d'Authentification

Le `AuthenticationOrchestrationService` coordonne le flux complet d'authentification:

**Fonctionnalités:**
- Démarrer le flux d'authentification avec les fournisseurs
- Compléter l'enregistrement de l'utilisateur
- Gérer les erreurs d'authentification
- Coordonner la gestion de session

**Exemple d'Utilisation:**

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
        // L'utilisateur est maintenant authentifié et redirigé
      },
      error: (error) => {
        console.error('Échec de l\'enregistrement', error);
      }
    });
  }
}
```

### 7. Guard d'Authentification

Le `openIDAuthGuard` protège les routes qui nécessitent une authentification:

**Exemple d'Utilisation:**

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

### 8. Extracteur de Paramètres de Callback

L'utilitaire `AuthCallbackParamsExtractor` extrait et valide les paramètres de callback:

**Fonctionnalités:**
- Extraire les paramètres de requête de l'URL de callback
- Vérifier les erreurs
- Déterminer le type de résultat de callback
- Valider l'état d'authentification

**Exemple d'Utilisation:**

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

## Flux d'Authentification

### 1. Initier l'Authentification

```typescript
// L'utilisateur clique sur "Se connecter avec Google"
orchestrationService.startAuthenticationFlow('google');

// Le backend génère l'URL d'autorisation
// L'utilisateur est redirigé vers Google
```

### 2. Authentification du Fournisseur

```
L'utilisateur s'authentifie avec Google
Google redirige vers l'endpoint de callback du backend
Le backend valide l'authentification et crée la session
```

### 3. Gestion du Callback

```typescript
// Le backend redirige vers l'URL de callback de l'application avec des paramètres
const params = paramsExtractor.extractCallbackParams(route);

if (params.internal_authentication_result === 'SUCCESS') {
  // L'utilisateur existe déjà, stocker le jeton et rediriger
  sessionService.login(params.token);
  router.navigate(['/keyring']);
}

if (params.internal_authentication_result === 'NON_EXISTING_USER') {
  // Afficher le formulaire d'enregistrement
  showRegistrationForm(params.register_user_operation_id);
}

if (params.internal_authentication_result === 'PARTIAL_MATCHING_USER') {
  // Afficher la confirmation de correspondance
  showMatchingDialog(params.matching_user_display_name);
}
```

### 4. Enregistrement de l'Utilisateur

```typescript
// L'utilisateur complète le formulaire d'enregistrement
orchestrationService.completeRegistration({
  register_user_operation_id: operationId,
  profile_display_name: 'Jean Dupont',
  profile_username: 'jeandupont'
}).subscribe(response => {
  // Le jeton est automatiquement stocké et l'utilisateur est redirigé
});
```

## Types et Interfaces

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

L'infrastructure utilise les dépendances suivantes:

```bash
npm install jwt-decode
```

## Configuration

Ajoutez ce qui suit à vos fichiers d'environnement:

```typescript
export const environment = {
  xihucalliAuthAPIHostname: 'VOTRE_HOSTNAME_API',
  authInitiateEndpoint: '/auth/initiate',
  authCallbackEndpoint: '/auth/callback',
  authRegisterEndpoint: '/register',
  callbackRedirectUrl: 'VOTRE_URL_CALLBACK_APP'
};
```

Enregistrez l'intercepteur d'authentification dans `app.config.ts`:

```typescript
import { authInterceptor } from '@commons/session';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

