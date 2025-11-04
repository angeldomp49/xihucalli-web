# Composant de Rappel d'Authentification

Ce document décrit le Composant de Rappel d'Authentification qui traite le rappel du fournisseur d'authentification OpenID après l'authentification de l'utilisateur.

## Vue d'ensemble

Le Composant de Rappel d'Authentification gère la redirection depuis le service d'authentification backend après que l'utilisateur s'est authentifié auprès d'un fournisseur OpenID (Google, Cognito, etc.). Il traite les paramètres du rappel et redirige l'utilisateur vers la destination appropriée en fonction du résultat de l'authentification.

## Caractéristiques

- Traite les paramètres de rappel d'authentification
- Gère l'authentification réussie avec stockage de jeton JWT
- Gère les exigences d'enregistrement d'utilisateur
- Gère les décisions de liaison de compte pour les correspondances partielles
- Fournit la gestion des erreurs et les retours utilisateur
- Redirection automatique selon l'état d'authentification

## Architecture

### Structure du Composant

Le composant de rappel utilise les services suivants :

- **AuthCallbackParamsExtractor**: Extrait et valide les paramètres du rappel depuis l'URL
- **TokenStorageService**: Stocke les jetons JWT dans le stockage local
- **Router**: Navigue vers les routes appropriées selon l'état d'authentification

### États d'Authentification

Le composant gère quatre états principaux :

1. **Succès**: Utilisateur authentifié avec succès, jeton JWT fourni
2. **Enregistrement Requis**: Authentification externe réussie mais l'utilisateur interne n'existe pas
3. **Décision de Correspondance Requise**: Authentification externe réussie mais correspondance partielle d'utilisateur trouvée
4. **Erreur**: Authentification échouée ou erreur survenue

## Utilisation

### Configuration de Route

La route de rappel est configurée dans le routage de l'application :

```typescript
export const routes: Routes = [
  {
    path: "auth/callback",
    component: AuthCallbackPageComponent
  }
];
```

### Paramètres d'URL du Rappel

Le backend redirige vers ce composant avec les paramètres de requête suivants :

#### Cas de Succès
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=SUCCESS&token=eyJhbGc...
```

#### Cas d'Enregistrement Requis
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=NON_EXISTING_USER&register_user_operation_id=abc123&register_user_operation_type=FRESH_INTERNAL_USER
```

#### Cas de Décision de Correspondance Requise
```
/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=PARTIAL_MATCHING_USER&register_user_operation_id=def456&register_user_operation_type=ATTACH_LOGIN_INFORMATION_TO_MASTER_USER&matching_user_display_name=John%20Doe
```

#### Cas d'Erreur
```
/auth/callback?external_authentication_result=FAILURE&error=Invalid+credentials
```

### Flux du Composant

```typescript
ngOnInit() {
  // Extraire les paramètres du rappel depuis l'URL
  const params = paramsExtractor.extractCallbackParams(route);
  
  // Vérifier l'état d'authentification et rediriger en conséquence
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

## Exemple d'Intégration

### Étape 1: L'utilisateur Initie la Connexion

```typescript
// Composant de connexion
initiateGoogleLogin(): void {
  this.authService.initiateAuthentication('google')
    .subscribe(response => {
      window.location.href = response.authorization_url;
    });
}
```

### Étape 2: Le Backend Traite l'Authentification

Le backend échange le code d'autorisation avec le fournisseur et redirige en retour :

```
https://votre-domaine.com/auth/callback?external_authentication_result=SUCCESS&internal_authentication_result=SUCCESS&token=eyJhbGc...
```

### Étape 3: Le Composant de Rappel Traite le Résultat

```typescript
// AuthCallbackPageComponent traite automatiquement le rappel
private handleAuthenticationSuccess(params: AuthCallbackParams): void {
  if (!params.token) {
    this.handleError({ error: 'No token received from server' });
    return;
  }

  this.tokenStorage.storeToken(params.token);
  this.router.navigate(['/keyring']);
}
```

### Étape 4: L'utilisateur Arrive sur la Route Protégée

L'utilisateur est automatiquement redirigé vers la page d'accueil avec le jeton JWT stocké.

## Gestion des Erreurs

Le composant fournit un retour visuel pour les erreurs :

- Affiche un message d'erreur à l'utilisateur
- Redirige automatiquement vers la page de connexion après 3 secondes
- Enregistre les erreurs dans la console pour le débogage

Exemple d'affichage d'erreur :

```html
<div class="error-state">
  <h2>Erreur d'Authentification</h2>
  <p>{{ errorMessage }}</p>
  <p>Redirection vers la page de connexion...</p>
</div>
```

## Considérations de Sécurité

1. **Validation d'État**: Le backend valide le paramètre d'état OAuth pour prévenir les attaques CSRF
2. **Stockage de Jeton**: Les jetons JWT sont stockés dans le stockage local pour la gestion de session
3. **Messages d'Erreur**: Des messages d'erreur génériques sont affichés aux utilisateurs pour éviter la divulgation d'informations
4. **Nettoyage Automatique**: Les tentatives d'authentification échouées redirigent vers la page de connexion

## Configuration de l'Environnement

L'URL de rappel doit être configurée dans l'environnement :

```typescript
export const environment = {
  callbackRedirectUrl: 'https://votre-domaine.com/auth/callback'
};
```

Cette URL doit également être enregistrée auprès des fournisseurs OpenID (Google, Cognito) en tant qu'URI de redirection autorisée.

## Composants Associés

- [Service d'Authentification OpenID](../infrastructure-authentification-openid.md)
- [Initiateur d'Authentification](./external-references/master_user/authentication-initiator.md)
- [Enregistrement d'Utilisateur](./external-references/master_user/register-user.md)
- [Système de Relation d'Utilisateurs](./external-references/master_user/user-relationship-system.md)

